import { Strain } from "./common";
import { sprintf } from 'sprintf-js';
import { ValueRange } from "./value-range";

export class HandEvaluation {
  _hcp = new ValueRange();
  _distributionPoints = new ValueRange();
  _totalPoints = new ValueRange();

  get hcp(): ValueRange {
    return this._hcp;
  }

  setHcpBounds(from: number | null, to: number | null): void {
    if (typeof from === 'number' && (!this._hcp.from || from > this._hcp.from)) {
      this._hcp.from = from;
    }
    if (typeof to === 'number' && (!this._hcp.to || to < this._hcp.to)) {
      this._hcp.to = to;
    }
  }

  setDistributionPointBounds(from: number | null, to: number | null): void {
    if (typeof from === 'number' && (!this._distributionPoints.from || from > this._distributionPoints.from)) {
      this._distributionPoints.from = from;
    }
    if (typeof to === 'number' && (!this._distributionPoints.to || to < this._distributionPoints.to)) {
      this._distributionPoints.to = to;
    }
  }

  setTotalPointBounds(from: number | null, to: number | null): void {
    if (typeof from === 'number' && (!this._totalPoints.from || from > this._totalPoints.from)) {
      this._totalPoints.from = from;
    }
    if (typeof to === 'number' && (!this._totalPoints.to || to < this._totalPoints.to)) {
      this._totalPoints.to = to;
    }
  }

  get distributionPoints(): ValueRange {
    return this._distributionPoints;
  }

  get totalPoints(): ValueRange {
    return this._totalPoints;
  }

  reset(): void {
    this._hcp = new ValueRange();
    this._distributionPoints = new ValueRange();
    this._totalPoints = new ValueRange();
  }

  toString(): string {
    return sprintf('HCP: %-6s Dist: %-6s Total: %-6s', this._hcp.toString(), this._distributionPoints.toString(), this._totalPoints.toString());
  }
}
