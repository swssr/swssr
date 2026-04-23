//Utility functions

async function postr(url, body) {
  const headers = { "Content-Type": "application/json" };
  const options = { body: JSON.stringify(body), method: "POST", headers };

  let serverResponse;
  await fetch(url, options)
    .then(response => (serverResponse = response))
    .catch(error => (serverResponse = error));

  return serverResponse;
}

function isEmail(_phrase) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(_phrase);
}

function hasError(node, errorClass, delay) {
  const _errorClass = errorClass || "error",
    _delay = delay || 400;
  isElement(node) && node.classList.add(_errorClass);
  setTimeout(() => node.classList.remove(_errorClass), _delay);
}

function isElement(obj) {
  try {
    return obj instanceof HTMLElement;
  } catch (e) {
    return (
      typeof obj === "object" &&
      obj.nodeType === 1 &&
      typeof obj.style === "object" &&
      typeof obj.ownerDocument === "object"
    );
  }
}
