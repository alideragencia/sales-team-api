
export const getMonthsAgo = (months: number) => {
    let today = new Date();
    today.setMonth(today.getMonth() - months);
    return today.toISOString().slice(0, 10);
}
