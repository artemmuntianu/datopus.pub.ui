export const getDateDayDiff = (endDate: Date, startDate: Date) => {
    const diffInMs = endDate.getTime() - startDate.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    return Math.round(Math.abs(diffInDays));
};