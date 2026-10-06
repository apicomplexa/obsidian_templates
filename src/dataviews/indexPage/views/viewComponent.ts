export class Component<Props = Record<string, any>> {
  constructor(
    readonly children: Component<any>[] = [],
    readonly props: Props = {} as Props
  ) {}

  public render(): void {
    this.children.forEach((c) => c.render());
  }
}
