// Exact integration keeps the motion consistent across screen refresh rates.
export function advanceRotor(state, seconds, cruise = 0) {
  const dt = Math.max(0, Math.min(seconds, .05));
  if (state.target !== null) {
    state.target += cruise * dt;
    const frequency = 12;
    const offset = state.angle - (state.target - cruise * dt);
    const relativeVelocity = state.velocity - cruise;
    const correction = (relativeVelocity + frequency * offset) * dt;
    const decay = Math.exp(-frequency * dt);
    state.angle = state.target + (offset + correction) * decay;
    state.velocity = cruise + (relativeVelocity - frequency * correction) * decay;
    if (Math.abs(state.angle - state.target) < .002 && Math.abs(state.velocity - cruise) < .02) state.target = null;
  } else {
    const friction = 2.6;
    const decay = Math.exp(-friction * dt);
    const excess = state.velocity - cruise;
    state.angle += cruise * dt + excess * (1 - decay) / friction;
    state.velocity = cruise + excess * decay;
  }
  return state;
}
