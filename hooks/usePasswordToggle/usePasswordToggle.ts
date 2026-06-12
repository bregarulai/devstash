import { useState } from 'react';

export function usePasswordToggle() {
  const [show, setShow] = useState(false);

  return { show, setShow, toggle: () => setShow((s) => !s) };
}
