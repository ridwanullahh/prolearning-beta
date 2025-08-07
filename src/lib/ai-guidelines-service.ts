import { db } from './github-sdk';

interface AIGuideline {
  id: string;
  title: string;
  description: string;
  category: 'content' | 'curriculum' | 'assessment' | 'general';
  priority: 'high' | 'medium' | 'low';
  guideline: string;
  isActive: boolean;
  appliesTo: string[];
  tags: string[];
  examples: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

class AIGuidelinesService {
  private guidelines: AIGuideline[] = [];
  private lastLoaded: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async loadGuidelines(): Promise<void> {
    const now = Date.now();
    if (now - this.lastLoaded < this.CACHE_DURATION && this.guidelines.length > 0) {
      return; // Use cached guidelines
    }

    try {
      const allGuidelines = await db.get('aiGuidelines');
      this.guidelines = allGuidelines.filter((g: AIGuideline) => g.isActive);
      this.lastLoaded = now;
      console.log(`Loaded ${this.guidelines.length} active AI guidelines`);
    } catch (error) {
      console.error('Error loading AI guidelines:', error);
      // Initialize with default guidelines if none exist
      await this.initializeDefaultGuidelines();
    }
  }

  async getGuidelinesForContentType(contentType: string): Promise<AIGuideline[]> {
    await this.loadGuidelines();
    return this.guidelines.filter(g => 
      g.appliesTo.includes(contentType) || g.appliesTo.includes('all')
    );
  }

  async getGuidelinesByCategory(category: string): Promise<AIGuideline[]> {
    await this.loadGuidelines();
    return this.guidelines.filter(g => g.category === category);
  }

  async getHighPriorityGuidelines(): Promise<AIGuideline[]> {
    await this.loadGuidelines();
    return this.guidelines.filter(g => g.priority === 'high');
  }

  async buildGuidelinesPrompt(contentType: string, category?: string): Promise<string> {
    const relevantGuidelines = await this.getGuidelinesForContentType(contentType);
    const categoryGuidelines = category ? await this.getGuidelinesByCategory(category) : [];
    const highPriorityGuidelines = await this.getHighPriorityGuidelines();

    // Combine and deduplicate guidelines
    const allRelevantGuidelines = new Map<string, AIGuideline>();
    
    // Add high priority guidelines first
    highPriorityGuidelines.forEach(g => allRelevantGuidelines.set(g.id, g));
    
    // Add category-specific guidelines
    categoryGuidelines.forEach(g => allRelevantGuidelines.set(g.id, g));
    
    // Add content-type specific guidelines
    relevantGuidelines.forEach(g => allRelevantGuidelines.set(g.id, g));

    const guidelines = Array.from(allRelevantGuidelines.values());

    if (guidelines.length === 0) {
      return this.getDefaultGuidelinesPrompt();
    }

    let prompt = `IMPORTANT: You must follow these content guidelines strictly when generating educational content:\n\n`;

    // Group by priority
    const highPriority = guidelines.filter(g => g.priority === 'high');
    const mediumPriority = guidelines.filter(g => g.priority === 'medium');
    const lowPriority = guidelines.filter(g => g.priority === 'low');

    if (highPriority.length > 0) {
      prompt += `CRITICAL GUIDELINES (Must Follow):\n`;
      highPriority.forEach((g, index) => {
        prompt += `${index + 1}. ${g.title}: ${g.guideline}\n`;
      });
      prompt += `\n`;
    }

    if (mediumPriority.length > 0) {
      prompt += `IMPORTANT GUIDELINES:\n`;
      mediumPriority.forEach((g, index) => {
        prompt += `${index + 1}. ${g.title}: ${g.guideline}\n`;
      });
      prompt += `\n`;
    }

    if (lowPriority.length > 0) {
      prompt += `ADDITIONAL GUIDELINES:\n`;
      lowPriority.forEach((g, index) => {
        prompt += `${index + 1}. ${g.title}: ${g.guideline}\n`;
      });
      prompt += `\n`;
    }

    prompt += `Please ensure all generated content adheres to these guidelines while maintaining educational quality and effectiveness.\n\n`;

    return prompt;
  }

  private getDefaultGuidelinesPrompt(): string {
    return `IMPORTANT: Follow these default content guidelines:

CRITICAL GUIDELINES (Must Follow):
1. Educational Appropriateness: Ensure all content is age-appropriate and educationally sound
2. Factual Accuracy: All information must be factually correct and up-to-date
3. Respectful Content: Content must be respectful of all cultures, religions, and backgrounds
4. Safe Learning Environment: Avoid content that could be harmful, offensive, or inappropriate

IMPORTANT GUIDELINES:
1. Clear Learning Objectives: Each lesson should have clear, measurable learning objectives
2. Engaging Content: Make content engaging and interactive where possible
3. Progressive Difficulty: Structure content with appropriate difficulty progression
4. Inclusive Language: Use inclusive and accessible language

Please ensure all generated content adheres to these guidelines while maintaining educational quality and effectiveness.

`;
  }

  private async initializeDefaultGuidelines(): Promise<void> {
    const defaultGuidelines = [
      {
        title: 'Educational Appropriateness',
        description: 'Ensure content is age-appropriate and educationally sound',
        category: 'content' as const,
        priority: 'high' as const,
        guideline: 'All educational content must be appropriate for the specified age group and academic level. Avoid complex concepts for younger learners and ensure content complexity matches the target audience.',
        appliesTo: ['courses', 'lessons', 'quizzes', 'flashcards'],
        tags: ['age-appropriate', 'educational'],
        examples: []
      },
      {
        title: 'Factual Accuracy',
        description: 'Ensure all information is factually correct and current',
        category: 'content' as const,
        priority: 'high' as const,
        guideline: 'All facts, figures, dates, and information must be accurate and up-to-date. When in doubt, indicate uncertainty or provide multiple perspectives on debated topics.',
        appliesTo: ['courses', 'lessons', 'quizzes'],
        tags: ['accuracy', 'facts'],
        examples: []
      },
      {
        title: 'Respectful Content',
        description: 'Content must respect all cultures, religions, and backgrounds',
        category: 'general' as const,
        priority: 'high' as const,
        guideline: 'Content should be respectful of diverse cultures, religions, and backgrounds. Avoid stereotypes, biased language, or content that could be offensive to any group. Present multiple perspectives when discussing cultural or historical topics.',
        appliesTo: ['courses', 'lessons'],
        tags: ['respect', 'diversity', 'inclusion'],
        examples: []
      },
      {
        title: 'Islamic Values Alignment',
        description: 'Content should not contradict Islamic principles while remaining secular',
        category: 'general' as const,
        priority: 'high' as const,
        guideline: 'While maintaining a secular educational approach, ensure content does not contradict fundamental Islamic principles. Avoid promoting concepts that conflict with Islamic values, but present information objectively and educationally.',
        appliesTo: ['courses', 'lessons'],
        tags: ['islamic-values', 'secular-education'],
        examples: []
      },
      {
        title: 'Clear Learning Objectives',
        description: 'Each lesson should have clear, measurable learning objectives',
        category: 'curriculum' as const,
        priority: 'medium' as const,
        guideline: 'Every lesson must include clear, specific, and measurable learning objectives that students can achieve. Use action verbs and specify what students will be able to do after completing the lesson.',
        appliesTo: ['lessons'],
        tags: ['objectives', 'learning-outcomes'],
        examples: []
      }
    ];

    try {
      for (const guideline of defaultGuidelines) {
        await db.insert('aiGuidelines', {
          ...guideline,
          createdBy: 'system',
          isActive: true
        });
      }
      console.log('Default AI guidelines initialized');
    } catch (error) {
      console.error('Error initializing default guidelines:', error);
    }
  }

  async validateContent(content: string, contentType: string): Promise<{
    isValid: boolean;
    violations: string[];
    suggestions: string[];
  }> {
    const guidelines = await this.getGuidelinesForContentType(contentType);
    const violations: string[] = [];
    const suggestions: string[] = [];

    // Basic validation rules based on guidelines
    const highPriorityGuidelines = guidelines.filter(g => g.priority === 'high');
    
    for (const guideline of highPriorityGuidelines) {
      // Simple keyword-based validation (can be enhanced with AI)
      if (guideline.title.includes('Respectful') && this.containsInappropriateContent(content)) {
        violations.push(`Content may violate "${guideline.title}" guideline`);
        suggestions.push('Review content for potentially offensive or inappropriate language');
      }
      
      if (guideline.title.includes('Factual') && this.containsUncertainClaims(content)) {
        suggestions.push('Verify factual claims and provide sources where appropriate');
      }
    }

    return {
      isValid: violations.length === 0,
      violations,
      suggestions
    };
  }

  private containsInappropriateContent(content: string): boolean {
    // Simple check for potentially inappropriate content
    const inappropriateKeywords = ['hate', 'discrimination', 'violence', 'inappropriate'];
    return inappropriateKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );
  }

  private containsUncertainClaims(content: string): boolean {
    // Check for absolute statements that might need verification
    const absoluteKeywords = ['always', 'never', 'all', 'none', 'every', 'definitely'];
    return absoluteKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );
  }
}

export const aiGuidelinesService = new AIGuidelinesService();
