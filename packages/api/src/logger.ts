export default {
  log: (type: string, payload?: any) => {
    const name = `@SERVER/${type}:`;

    if (payload === undefined) {
      console.log(name);
    } else {
      console.log(name, payload);
    }
  },
};
