import { client } from "..";

export class Feature {
  constructor(public name: string, public run: (c: typeof client) => any) {}
}
