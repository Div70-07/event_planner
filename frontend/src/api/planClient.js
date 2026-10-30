/**
 * Client for communicating with the backend API.
 */

/**
 * Sends plan generation request to POST /api/plan
 *
 * @param {Object} planInput - Validated form input
 * @returns {Promise<{ aiEnhanced: boolean, plan: Object, aiNotice?: string }>}
 */
export async function generatePlanApi(planInput) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s client timeout

  try {
    const res = await fetch('/api/plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(planInput),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMessage =
        data?.error?.message ||
        (data?.error?.details && data.error.details.map((d) => d.message).join(', ')) ||
        `Request failed with status ${res.status}`;
      const err = new Error(errorMessage);
      err.status = res.status;
      err.code = data?.error?.code || 'API_ERROR';
      err.details = data?.error?.details || [];
      throw err;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Plan generation timed out. Please try again.');
    }
    throw error;
  }
}
