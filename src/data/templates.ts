import { SubjectCategory, SubjectLevel, StudyModule, Flashcard } from '../types';

export interface SubjectTemplate {
  id: string;
  title: string;
  category: SubjectCategory;
  level: SubjectLevel;
  color: string;
  coverImage?: string;
  description: string;
  targetWeeklyHours: number;
  modules: Omit<StudyModule, 'id'>[];
  starterFlashcards: Omit<Flashcard, 'id' | 'subjectId'>[];
}

export const SUBJECT_TEMPLATES: SubjectTemplate[] = [
  {
    id: 'tpl-rust-systems',
    title: 'Modern Rust & Systems Programming',
    category: 'engineering',
    level: 'intermediate',
    color: '#0284c7', // Sky / Azure
    coverImage: '/src/assets/images/study_concept_coding_1790327563445.jpg',
    description: 'Master ownership, borrowing, lifetime semantics, concurrency without data races, and build high-performance WebAssembly tools.',
    targetWeeklyHours: 8,
    modules: [
      {
        title: '01. Memory Safety & The Borrow Checker',
        description: 'Deep dive into stack vs heap allocations, moving vs copying semantics, and mutable borrows.',
        status: 'in_progress',
        estimatedHours: 12,
        items: [
          { id: 'item-1', title: 'Ownership Rules & Move Semantics', isCompleted: true },
          { id: 'item-2', title: 'References and Borrowing Rules (One mutable XOR multiple immutables)', isCompleted: true },
          { id: 'item-3', title: 'Slice Types & Memory Layout in Heap', isCompleted: false },
          { id: 'item-4', title: 'Lifetimes annotation syntax & elision rules', isCompleted: false },
        ],
      },
      {
        title: '02. Generics, Traits & Associated Types',
        description: 'Polymorphism via static dispatch and zero-cost abstractions.',
        status: 'not_started',
        estimatedHours: 10,
        items: [
          { id: 'item-5', title: 'Defining Traits and implementing for standard types', isCompleted: false },
          { id: 'item-6', title: 'Trait Bounds and where clauses', isCompleted: false },
          { id: 'item-7', title: 'Dynamic dispatch with Trait Objects (dyn Trait)', isCompleted: false },
          { id: 'item-8', title: 'Operator overloading with std::ops', isCompleted: false },
        ],
      },
      {
        title: '03. Fearless Concurrency & Async Tokio',
        description: 'Threads, message passing with channels, shared state with Arc & Mutex, and async runtime.',
        status: 'not_started',
        estimatedHours: 14,
        items: [
          { id: 'item-9', title: 'Using spawn and join handles', isCompleted: false },
          { id: 'item-10', title: 'MPSC Channels (Multi-producer, single-consumer)', isCompleted: false },
          { id: 'item-11', title: 'Sync and Send marker traits', isCompleted: false },
          { id: 'item-12', title: 'Tokio async executor and Future polling', isCompleted: false },
        ],
      },
    ],
    starterFlashcards: [
      {
        front: 'What are the three core rules of Rust Ownership?',
        back: '1. Each value in Rust has an owner.\n2. There can only be one owner at a time.\n3. When the owner goes out of scope, the value is dropped.',
        difficulty: 'good',
        nextReviewDate: new Date().toISOString().split('T')[0],
        intervalDays: 4,
        reviewCount: 2,
        lastReviewed: null,
      },
      {
        front: 'What is the distinction between Copy and Clone traits in Rust?',
        back: 'Copy is an implicit, bitwise shallow copy (free or cheap, e.g. primitives like i32). Clone is an explicit method call that may perform deep heap allocation or custom copying logic.',
        difficulty: 'new',
        nextReviewDate: new Date().toISOString().split('T')[0],
        intervalDays: 1,
        reviewCount: 0,
        lastReviewed: null,
      },
      {
        front: 'Can a variable have both a mutable reference and an immutable reference simultaneously?',
        back: 'No. Rust enforces: You may have either one mutable reference OR any number of immutable references, but not both in the same scope.',
        difficulty: 'good',
        nextReviewDate: new Date().toISOString().split('T')[0],
        intervalDays: 3,
        reviewCount: 1,
        lastReviewed: null,
      },
    ],
  },
  {
    id: 'tpl-conversational-spanish',
    title: 'Conversational Spanish (B1 to B2)',
    category: 'language',
    level: 'intermediate',
    color: '#059669', // Emerald
    coverImage: '/src/assets/images/study_concept_languages_1790327575970.jpg',
    description: 'Transition from intermediate grammar drills to spontaneous spoken fluency, subjunctive moods, and natural idioms.',
    targetWeeklyHours: 6,
    modules: [
      {
        title: '01. Subjunctive Mood Fundamentals (El Subjuntivo)',
        description: 'Expressing desires, doubts, possibilities, and hypothetical situations.',
        status: 'in_progress',
        estimatedHours: 8,
        items: [
          { id: 'sp-1', title: 'W.E.I.R.D.O. triggers (Wishes, Emotions, Impersonal, etc.)', isCompleted: true },
          { id: 'sp-2', title: 'Present subjunctive regular vs irregular conjugations', isCompleted: true },
          { id: 'sp-3', title: 'Imperfect subjunctive (-ra vs -se endings)', isCompleted: false },
          { id: 'sp-4', title: 'Conditional sentences with "Si tuviera... haría..."', isCompleted: false },
        ],
      },
      {
        title: '02. Conversational Connectors & Discourse Markers',
        description: 'Linking ideas seamlessly without pausing: sin embargo, por lo tanto, a pesar de que.',
        status: 'not_started',
        estimatedHours: 6,
        items: [
          { id: 'sp-5', title: 'Contrast connectors (a diferencia de, no obstante)', isCompleted: false },
          { id: 'sp-6', title: 'Cause & Consequence markers (dado que, por consiguiente)', isCompleted: false },
          { id: 'sp-7', title: 'Fillers and holding the floor (o sea, bueno, fíjate que)', isCompleted: false },
        ],
      },
      {
        title: '03. Pronunciation & Natural Accent Rhythm',
        description: 'Linking vowels between words (sinalefa) and soft dental consonant sounds.',
        status: 'not_started',
        estimatedHours: 5,
        items: [
          { id: 'sp-8', title: 'Sinalefa drills with rapid audiobook shadowing', isCompleted: false },
          { id: 'sp-9', title: 'Distinction between tapped "r" and rolled "rr"', isCompleted: false },
        ],
      },
    ],
    starterFlashcards: [
      {
        front: 'Translate & conjugate: "I doubt that he has enough money" (Dudar que...)',
        back: 'Dudo que él tenga suficiente dinero.\n(Uses Subjunctive "tenga" because "dudar" conveys epistemic uncertainty).',
        difficulty: 'good',
        nextReviewDate: new Date().toISOString().split('T')[0],
        intervalDays: 2,
        reviewCount: 1,
        lastReviewed: null,
      },
      {
        front: 'What is the natural conversational idiom for "To cost an arm and a leg" in Spanish?',
        back: '"Costar un ojo de la cara" (Literally: to cost an eye from the face).',
        difficulty: 'easy',
        nextReviewDate: new Date().toISOString().split('T')[0],
        intervalDays: 5,
        reviewCount: 3,
        lastReviewed: null,
      },
    ],
  },
  {
    id: 'tpl-machine-learning',
    title: 'Applied Machine Learning & Neural Nets',
    category: 'science',
    level: 'beginner',
    color: '#7c3aed', // Purple / Violet
    coverImage: '/src/assets/images/study_concept_coding_1790327563445.jpg',
    description: 'From linear regression to deep neural architectures, backpropagation mathematics, PyTorch tensors, and validation pipelines.',
    targetWeeklyHours: 10,
    modules: [
      {
        title: '01. Linear Algebra & Gradient Calculus for ML',
        description: 'Vector projections, matrix multiplications, partial derivatives, and chain rule computation graphs.',
        status: 'not_started',
        estimatedHours: 9,
        items: [
          { id: 'ml-1', title: 'Matrix rank, dot products, and cosine similarity', isCompleted: false },
          { id: 'ml-2', title: 'Computing gradients of MSE loss function', isCompleted: false },
          { id: 'ml-3', title: 'Stochastic Gradient Descent (SGD) with momentum', isCompleted: false },
        ],
      },
      {
        title: '02. Feedforward Networks & PyTorch Fundamentals',
        description: 'Building custom nn.Module architectures and training loops.',
        status: 'not_started',
        estimatedHours: 12,
        items: [
          { id: 'ml-4', title: 'PyTorch autograd and tensor computations', isCompleted: false },
          { id: 'ml-5', title: 'Activation functions (ReLU, GELU, Softmax) trade-offs', isCompleted: false },
          { id: 'ml-6', title: 'Overfitting mitigation: Dropout, L2 weight decay', isCompleted: false },
        ],
      },
    ],
    starterFlashcards: [
      {
        front: 'Why do we use ReLU instead of Sigmoid for hidden layers in deep neural nets?',
        back: 'Sigmoid suffers from vanishing gradients when inputs are strongly positive or negative (derivative near zero). ReLU maintains a constant gradient of 1 for x > 0, enabling effective backprop across deep layers.',
        difficulty: 'new',
        nextReviewDate: new Date().toISOString().split('T')[0],
        intervalDays: 1,
        reviewCount: 0,
        lastReviewed: null,
      },
    ],
  },
  {
    id: 'tpl-ux-design-systems',
    title: 'Design Systems & UX Architecture',
    category: 'creative',
    level: 'intermediate',
    color: '#d97706', // Amber
    coverImage: '/src/assets/images/study_concept_languages_1790327575970.jpg',
    description: 'Construct scalable design token architectures, accessible component specs, micro-interaction states, and Figma variables.',
    targetWeeklyHours: 5,
    modules: [
      {
        title: '01. Design Tokens & Multi-Theme Architecture',
        description: 'Global, alias, and component-specific token tiers with dark mode contrast math.',
        status: 'not_started',
        estimatedHours: 8,
        items: [
          { id: 'ux-1', title: 'Token naming taxonomy (Namespace, Object, Variant, State)', isCompleted: false },
          { id: 'ux-2', title: 'APCA / WCAG 2.2 contrast ratios for interactive components', isCompleted: false },
          { id: 'ux-3', title: 'Figma Variables binding and responsive spacing units', isCompleted: false },
        ],
      },
    ],
    starterFlashcards: [
      {
        front: 'What is the three-tier hierarchy of design tokens?',
        back: '1. Global / Primitive tokens (e.g. blue-500: #3b82f6)\n2. Semantic / System tokens (e.g. color-action-primary: {blue-500})\n3. Component tokens (e.g. button-bg-default: {color-action-primary})',
        difficulty: 'new',
        nextReviewDate: new Date().toISOString().split('T')[0],
        intervalDays: 1,
        reviewCount: 0,
        lastReviewed: null,
      },
    ],
  },
];
