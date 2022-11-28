export const calculateOffset = (limit?: number, page?: number) => {
  limit = limit === undefined || limit === null ? 20 : limit;
  page = page === undefined || page === null ? 1 : page;

  return (page - 1) * limit;
};
