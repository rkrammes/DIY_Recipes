import ErrorHandler from './error-handler.js';

export function handleApiResponse(promise, successCallback, errorCallback) {
  return promise
    .then(({ data, error }) => {
      if (error) {
        ErrorHandler.handleApiError(error);
        if (errorCallback) errorCallback(error);
        return null;
      }
      if (successCallback) successCallback(data);
      return data;
    })
    .catch(unexpectedError => {
      ErrorHandler.handleApiError(unexpectedError, 'Unexpected API error');
      if (errorCallback) errorCallback(unexpectedError);
      return null;
    });
}