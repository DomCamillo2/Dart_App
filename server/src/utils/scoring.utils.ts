export const STARTING_SCORE = 501;

export const calculateRemainingScore = (currentScore: number, throwValue: number, multiplier: number): number => {
    return currentScore - (throwValue * multiplier);
};

export const isBust = (remainingScore: number): boolean => {
    return remainingScore < 0 || remainingScore === 1;
};
