const distanceNoSqrt = (x1, y1, x2, y2) => {
  const xDiff = x2 - x1;
  const yDiff = y2 - y1;
  return xDiff * xDiff + yDiff * yDiff;
};

module.exports = {
  distanceNoSqrt,
};
