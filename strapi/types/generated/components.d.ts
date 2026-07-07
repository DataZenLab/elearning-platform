import type { Schema, Struct } from '@strapi/strapi';

export interface QuizQuestions extends Struct.ComponentSchema {
  collectionName: 'components_quiz_questions';
  info: {
    displayName: 'questions';
  };
  attributes: {
    courseCount: Schema.Attribute.Integer;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'quiz.questions': QuizQuestions;
    }
  }
}
