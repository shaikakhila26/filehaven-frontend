// Exponential backoff wrapper for fetch
export async function retryFetch(fn, { retries = 3, delay = 800, factor = 2 } = {}) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise(res => setTimeout(res, delay));
    return retryFetch(fn, { retries: retries - 1, delay: delay * factor, factor });
  }
}
