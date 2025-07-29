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
};