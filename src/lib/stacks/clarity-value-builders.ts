// Fluent builder for Clarity function arguments
import { uintCV, intCV, boolCV, stringAsciiCV, stringUtf8CV, bufferCV, listCV, tupleCV, standardPrincipalCV, contractPrincipalCV, noneCV, someCV } from './clarity-values';
import type { ClarityValue } from './clarity-values';
/** Fluent builder for contract call args */
export class CVBuilder {
  private args: ClarityValue[] = [];
  uint(value: bigint | number): this {
    this.args.push(uintCV(BigInt(value)));
    return this;
  }
  int(value: bigint | number): this {
    this.args.push(intCV(BigInt(value)));
    return this;
  }
  bool(value: boolean): this {
    this.args.push(boolCV(value));
    return this;
  }
  ascii(value: string): this {
    this.args.push(stringAsciiCV(value));
    return this;
  }
  utf8(value: string): this {
    this.args.push(stringUtf8CV(value));
    return this;
  }
  buffer(value: Uint8Array): this {
    this.args.push(bufferCV(value));
    return this;
  }
  list(values: ClarityValue[]): this {
    this.args.push(listCV(values));
    return this;
  }
  tuple(data: Record<string, ClarityValue>): this {
    this.args.push(tupleCV(data));
    return this;
  }
  principal(address: string): this {
    this.args.push(standardPrincipalCV(address));
    return this;
  }
  contractPrincipal(address: string, name: string): this {
    this.args.push(contractPrincipalCV(address, name));
    return this;
  }
  none(): this {
    this.args.push(noneCV());
    return this;
  }
  some(value: ClarityValue): this {
    this.args.push(someCV(value));
    return this;
  }
  build(): ClarityValue[] {
    return [...this.args];
  }
}
/** Create a new CVBuilder instance */
export function cvArgs(): CVBuilder {
  return new CVBuilder();
}
