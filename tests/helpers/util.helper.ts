export namespace UtilHelper {
  export const log = (...msg: string[]) => {
    return console.log('SPEC:', ...msg);
  }
}
