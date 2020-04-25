export default {
  log: (type: string, payload?: any) => {
    console.log(`@SERVER/${type}:`, payload);
  },
};
