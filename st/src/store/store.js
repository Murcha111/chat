export class Storage {
  get(key) {
    return JSON.parse(localStorage.getItem(key) || null);
  }

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  destroy(key) {
    localStorage.removeItem(key);
  }

  setQuestions(key, value) {
    const existingQuestions = this.get(key);
    const updatedQuestions = Array.isArray(existingQuestions)
      ? [...existingQuestions, value]
      : [value];
    this.set(key, updatedQuestions);
  }
}
