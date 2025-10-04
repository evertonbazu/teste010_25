
export enum Screen {
    LOGIN,
    GAME,
    END,
}

export interface Question {
    question: string;
    options?: string[];
    answer: string;
    feedbacks?: { [key: string]: string };
    type?: 'input';
}

export interface User {
    name: string;
    code: string;
    turma: string;
    firstName: string;
}

export interface RankingEntry {
    code: string;
    name: string;
    score: number;
    turma: string;
}

export interface GameResult {
    score: number;
    totalQuestions: number;
    timeSpent: number;
}
