function base64(arrayBuffer) {
  const array = []
  const view = new DataView(arrayBuffer);
  for (let i = 0; i !== view.byteLength; ++i) {
    const ch = view.getUint8(i);
    array.push(String.fromCharCode(ch));
  } // for ...
  return btoa(array.join(''));
} // base64

async function sha256(str) {
  // We transform the string into an arraybuffer.
  const buffer = new TextEncoder("utf-8").encode(str);
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return base64(hash);
} // sha256

export default sha256;
