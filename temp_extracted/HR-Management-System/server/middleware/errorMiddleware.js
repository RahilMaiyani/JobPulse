const errorMiddleware = (err, req, res, next) => {
  console.error("ERROR:", err);

  res.status(500).json({
    success: false,
    message: "Something went wrong in server",
    error : err
  });
};

export default errorMiddleware;