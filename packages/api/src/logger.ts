export default {
  log: (type: string, payload?: any) => {
    if (process.env.NODE_ENV === "test") return;

    const name = `@SERVER/${type}:`;

    if (payload === undefined) {
      console.log(name);
    } else {
      console.log(name, payload);
    }
  },
};
