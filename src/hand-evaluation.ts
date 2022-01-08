import { Strain, ValueRange } from "./common";

export class HandEvaluation {
  _strains: Strain[] = [];
  _hcp: ValueRange = { from: 0, to: 40 };
  _distributionPoints: ValueRange = { from: 0, to: 24 };
  _totalPoints: ValueRange = { from: 0, to: 40 };

  get strains(): Strain[] {
    return Array.from(this._strains);
  }

  get hcp(): ValueRange {
    return this._hcp;
  }

  setHcpBounds(from: number | null, to: number | null): void {
    if (typeof from === 'number') {
      this._hcp.from = from;
      if (from > this._totalPoints.from) {
        this._totalPoints.from = from;
      }
    }
    if (typeof to === 'number') {
      this._hcp.to = to;
      if (to < this._distributionPoints.to) {
        this._distributionPoints.to = to;
      }
      if (to < this._totalPoints.to - this._distributionPoints.to) {
        this._totalPoints.to = to + this._distributionPoints.to;
      }
    }
  }

  setDistributionPointBounds(from: number | null, to: number | null): void {
    if (typeof from === 'number') {
      this._distributionPoints.from = from;
      if (from > this._totalPoints.from) {
        this._totalPoints.from = this._hcp.from + from;
      }
    }
    if (typeof to === 'number') {
      this._distributionPoints.to = to;
      if (to < this._totalPoints.to - this._hcp.to) {
        this._totalPoints.to = this._hcp.to + to;
      }
    }
  }

  setTotalPointBounds(from: number | null, to: number | null): void {
    if (typeof from === 'number') {
      this._totalPoints.from = from;
      if (from > this._hcp.from + this._distributionPoints.from) {
        this._hcp.from = from - this._distributionPoints.from;
      }
    }
    if (typeof to === 'number') {
      this._totalPoints.to = to;
      if (to < this._hcp.to + this._distributionPoints.to) {
        this._hcp.to = to - this._distributionPoints.to;
      }
    }
  }

  get distributionPoints(): ValueRange {
    return this._distributionPoints;
  }

  get totalPoints(): ValueRange {
    return this._totalPoints;
  }

  addStrain(strain: Strain): void {
    if (this._strains.indexOf(strain) <= 0) {
      this._strains.push(strain);
    }
  }

  reset(): void {
    this._strains = [];
    this._hcp = { from: 0, to: 40 };
    this._distributionPoints = { from: 0, to: 24 };
    this._totalPoints = { from: 0, to: 40 };
  }
}
