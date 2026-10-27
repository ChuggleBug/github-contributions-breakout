// From grubersjoe/github-contributions-api
export type Contribution = {
    date: string;
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
};

export type Response = {
    total: {
        [year: number]: number;
        [year: string]: number; // 'lastYear;
    };
    contributions: Array<Contribution>;
};

export type NestedResponse = {
    total: {
        [year: number]: number;
        [year: string]: number; // 'lastYear;
    };
    contributions: {
        [year: number]: {
            [month: number]: {
                [day: number]: Contribution;
            };
        };
    };
};

export type ErrorResponse = {
    error: string;
    issues?: Array<{
        code: string;
        path: string;
        message: string;
    }>;
};
