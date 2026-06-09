export const generateResponse = (data = {}, message = "Success", statusCode = 200) => {
  return {
    success: true,
    message,
    statusCode,
    data,
  };
};

export const generateError = (message = "Error", statusCode = 500, details = null) => {
  return {
    success: false,
    message,
    statusCode,
    ...(details && { details }),
  };
};

export const formatPaginationResponse = (data, page, limit, total) => {
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
