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
