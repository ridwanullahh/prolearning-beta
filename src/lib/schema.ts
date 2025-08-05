export const schema = {
  users: {
    email: 'string',
    password: 'string', // Optional for OAuth providers
    name: 'string',
    role: 'string', // e.g., 'learner', 'instructor', 'admin'
    profile: 'object',
    googleId: 'string',
    resetPasswordToken: 'string',
    resetPasswordExpires: 'string',
    onboardingCompleted: 'boolean',
    approvalStatus: 'string', // 'pending', 'approved', 'rejected'
    instructorProfile: 'object',
    createdAt: 'string',
    updatedAt: 'string',
  },
  courses: {
    title: 'string',
    description: 'string',
    instructorId: 'string',
    price: 'number',
    tags: 'array',
    isPublished: 'boolean',
    level: 'string',
    grade: 'string',
    createdAt: 'string',
    updatedAt: 'string',
  },
  lessons: {
    courseId: 'string',
    title: 'string',
    description: 'string',
    order: 'number',
    duration: 'number',
    contents: 'array', // Array of content blocks (e.g., { type: 'rich_text', content: '...' })
    quiz: 'object', // Quiz object
    flashcards: 'array', // Array of flashcard objects
    keyPoints: 'array', // Array of key point objects
    mindMap: 'object', // Mind map object
    isAiGenerated: 'boolean',
    createdAt: 'string',
    updatedAt: 'string',
  },
  enrollments: {
    userId: 'string',
    courseId: 'string',
    progress: 'number',
    completed: 'boolean',
    createdAt: 'string',
    updatedAt: 'string',
  },
  lessonContents: {
    lessonId: 'string',
    type: 'string',
    content: 'string',
    order: 'number',
    createdAt: 'string',
    updatedAt: 'string',
  },
  quizzes: {
    lessonId: 'string',
    courseId: 'string',
    title: 'string',
    questions: 'array',
    passingScore: 'number',
    attempts: 'number',
    createdAt: 'string',
    updatedAt: 'string',
  },
  flashcards: {
    lessonId: 'string',
    courseId: 'string',
    front: 'string',
    back: 'string',
    difficulty: 'string',
    hint: 'string',
    createdAt: 'string',
    updatedAt: 'string',
  },
  keyPoints: {
    lessonId: 'string',
    courseId: 'string',
    point: 'string',
    explanation: 'string',
    importance: 'string',
    examples: 'string',
    createdAt: 'string',
    updatedAt: 'string',
  },
  mindMaps: {
    lessonId: 'string',
    courseId: 'string',
    title: 'string',
    data: 'object',
    createdAt: 'string',
    updatedAt: 'string',
  },
  userProgress: {
    userId: 'string',
    courseId: 'string',
    lessonId: 'string',
    completed: 'boolean',
    score: 'number',
    createdAt: 'string',
    updatedAt: 'string',
  },
  aiGenerationUsage: {
    userId: 'string',
    month: 'string',
    freeGenerationsUsed: 'number',
    paidGenerationsUsed: 'number',
    subscriptionActive: 'boolean',
    createdAt: 'string',
    updatedAt: 'string',
  },
  cart: {
    userId: 'string',
    items: 'array', // [{ courseId, price, quantity }]
    createdAt: 'string',
    updatedAt: 'string',
  },
  orders: {
    userId: 'string',
    items: 'array', // [{ courseId, price, quantity }]
    total: 'number',
    status: 'string', // e.g., 'pending', 'completed', 'failed'
    paymentGateway: 'string',
    transactionId: 'string',
    createdAt: 'string',
    updatedAt: 'string',
  },
  transactions: {
    userId: 'string',
    orderId: 'string',
    amount: 'number',
    currency: 'string',
    status: 'string',
    gateway: 'string',
    gatewayTransactionId: 'string',
    createdAt: 'string',
    updatedAt: 'string',
  },
  wallets: {
    userId: 'string',
    balance: 'number',
    currency: 'string',
    createdAt: 'string',
    updatedAt: 'string',
  },
  walletTransactions: {
    walletId: 'string',
    type: 'string', // 'credit' or 'debit'
    amount: 'number',
    description: 'string',
    relatedEntityId: 'string', // e.g., orderId, withdrawalId
    relatedEntityType: 'string',
    createdAt: 'string',
    updatedAt: 'string',
  },
  withdrawals: {
    userId: 'string',
    amount: 'number',
    status: 'string', // 'pending', 'approved', 'rejected'
    method: 'string',
    details: 'object',
    createdAt: 'string',
    updatedAt: 'string',
  },
  payouts: {
    instructorId: 'string',
    amount: 'number',
    status: 'string', // 'pending', 'paid', 'failed'
    payoutDate: 'string',
    createdAt: 'string',
    updatedAt: 'string',
  },
  notifications: {
    userId: 'string',
    message: 'string',
    isRead: 'boolean',
    type: 'string',
    link: 'string',
    createdAt: 'string',
    updatedAt: 'string',
  },
  // Static tables
  academicLevels: {
    name: 'string',
    description: 'string',
    order: 'number',
  },
  subjects: {
    name: 'string',
    description: 'string',
  },
  qualifications: {
    name: 'string',
    level: 'number',
    description: 'string',
    country: 'string',
  },
  instructorQualifications: {
    instructorId: 'string',
    qualificationId: 'string',
    status: 'string', // 'approved', 'pending'
    documentUrl: 'string',
  },
  pendingQualifications: {
    instructorId: 'string',
    qualificationId: 'string',
        documentUrl: 'string',
    status: 'string', // 'pending', 'approved', 'rejected'
  },
  courseTracks: {
    title: 'string',
    description: 'string',
    instructorId: 'string',
    price: 'number',
    tags: 'array',
    isPublished: 'boolean',
    level: 'string',
    createdAt: 'string',
    updatedAt: 'string',
  },
  courseTrackCourses: {
    courseTrackId: 'string',
    courseId: 'string',
    order: 'number',
    prerequisiteCourseId: 'string', // Optional: ID of the course that must be completed before this one
    createdAt: 'string',
    updatedAt: 'string',
  },
  courseTrackEnrollments: {
    userId: 'string',
    courseTrackId: 'string',
    progress: 'number', // Percentage of the track completed
    completed: 'boolean',
    createdAt: 'string',
    updatedAt: 'string',
  },
  forums: {
    courseId: 'string', // Each course has one forum
    title: 'string',
    description: 'string',
    isActive: 'boolean',
    createdAt: 'string',
    updatedAt: 'string',
  },
  forumThreads: {
    forumId: 'string',
    courseId: 'string', // Direct reference for easier querying
    lessonId: 'string', // Optional: for lesson-specific threads
    userId: 'string', // User who created the thread
    title: 'string',
    content: 'string', // Initial post content
    type: 'string', // 'general', 'lesson', 'question', 'discussion'
    isPinned: 'boolean',
    isLocked: 'boolean',
    isAnswered: 'boolean', // For question threads
    tags: 'array',
    viewCount: 'number',
    lastActivityAt: 'string',
    lastActivityUserId: 'string',
    createdAt: 'string',
    updatedAt: 'string',
  },
  forumPosts: {
    threadId: 'string',
    userId: 'string',
    content: 'string',
    isAnswer: 'boolean',
    isEdited: 'boolean',
    editedAt: 'string',
    parentPostId: 'string', // For nested replies
    likes: 'number',
    dislikes: 'number',
    attachments: 'array',
    createdAt: 'string',
    updatedAt: 'string',
  },
  forumPostReactions: {
    postId: 'string',
    userId: 'string',
    type: 'string', // 'like', 'dislike', 'helpful', 'insightful'
    createdAt: 'string',
  },
  geminiApiKeys: {
    key: 'string',
    name: 'string', // Friendly name for the key
    usageCount: 'number',
    dailyUsageCount: 'number',
    lastUsedAt: 'string',
    lastResetAt: 'string', // For daily usage reset
    isActive: 'boolean',
    rateLimit: 'number', // requests per minute
    dailyLimit: 'number', // requests per day
    priority: 'number', // For key selection priority
    createdAt: 'string',
    updatedAt: 'string',
  },
  aiChatSessions: {
    userId: 'string',
    title: 'string',
    context: 'object', // e.g., { courseId, lessonId, type: 'lesson'|'course'|'general' }
    isActive: 'boolean',
    lastMessageAt: 'string',
    messageCount: 'number',
    tags: 'array',
    createdAt: 'string',
    updatedAt: 'string',
  },
  aiChatMessages: {
    sessionId: 'string',
    role: 'string', // 'user' or 'assistant'
    content: 'string',
    tokens: 'number', // Token count for usage tracking
    model: 'string', // Model used for this message
    isContextual: 'boolean', // Whether message used contextual data
    metadata: 'object', // Additional metadata like response time, etc.
    createdAt: 'string',
    updatedAt: 'string',
  },
  noteFolders: {
    userId: 'string',
    name: 'string',
    description: 'string',
    color: 'string', // Hex color for folder
    parentFolderId: 'string', // For nested folders
    isShared: 'boolean',
    shareSettings: 'object',
    createdAt: 'string',
    updatedAt: 'string',
  },
  noteCategories: {
    userId: 'string',
    name: 'string',
    description: 'string',
    color: 'string', // Hex color for category
    icon: 'string', // Icon name
    createdAt: 'string',
    updatedAt: 'string',
  },
  notes: {
    userId: 'string',
    folderId: 'string',
    categoryId: 'string',
    title: 'string',
    content: 'string', // Rich text/markdown
    plainTextContent: 'string', // For search purposes
    isArchived: 'boolean',
    isFavorite: 'boolean',
    isPinned: 'boolean',
    tags: 'array',
    lessonId: 'string', // for contextual notes
    courseId: 'string', // for contextual notes
    attachments: 'array',
    wordCount: 'number',
    readingTime: 'number', // Estimated reading time in minutes
    lastViewedAt: 'string',
    version: 'number', // For version control
    isAiEnhanced: 'boolean', // Whether AI has enhanced this note
    createdAt: 'string',
    updatedAt: 'string',
  },
  noteVersions: {
    noteId: 'string',
    version: 'number',
    content: 'string',
    changeDescription: 'string',
    createdAt: 'string',
  },
  conversations: {
    participantIds: 'array', // [userId1, userId2]
    type: 'string', // 'direct', 'group'
    title: 'string', // Optional title for group conversations
    lastMessageId: 'string',
    lastMessageAt: 'string',
    isActive: 'boolean',
    courseId: 'string', // Optional: for course-specific conversations
    metadata: 'object', // Additional conversation metadata
    createdAt: 'string',
    updatedAt: 'string',
  },
  messages: {
    conversationId: 'string',
    senderId: 'string',
    content: 'string',
    type: 'string', // 'text', 'file', 'image', 'system'
    isRead: 'boolean',
    isEdited: 'boolean',
    editedAt: 'string',
    replyToMessageId: 'string', // For threaded replies
    attachments: 'array',
    reactions: 'array', // Array of reaction objects
    deliveredAt: 'string',
    readAt: 'string',
    createdAt: 'string',
    updatedAt: 'string',
  },
  messageReactions: {
    messageId: 'string',
    userId: 'string',
    emoji: 'string',
    createdAt: 'string',
  },
  messageReadReceipts: {
    messageId: 'string',
    userId: 'string',
    readAt: 'string',
    createdAt: 'string',
  },
};