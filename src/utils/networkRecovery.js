/**
 * Network Error Recovery
 */

export const checkNetworkStatus = async () => {
  try {
    await fetch('https://api.hiro.so/extended/v1/status');
    return true;
  } catch {
    return false;
  }
};

export const waitForNetwork = async (maxWait = 30000) => {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWait) {
    if (await checkNetworkStatus()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return false;
};
