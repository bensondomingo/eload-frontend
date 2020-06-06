const encodeParams = paramObject =>
  Object.entries(paramObject)
    .map(kv => kv.map(encodeURIComponent).join('='))
    .join('&');

export { encodeParams };
