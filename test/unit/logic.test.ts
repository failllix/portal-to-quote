import { describe, it, expect } from "vitest";
import { calculatePriceDetails } from "../../app/material-selection/logic";

describe("calculatePriceDetails", () => {
  describe("Basic Calculations", () => {
    it("calculates unit price and subtotal correctly without discount", () => {
      const result = calculatePriceDetails({
        volumeCm3: 10,
        materialPrice: 5,
        quantity: 1,
      });

      expect(result.unitPrice).toBe(50);
      expect(result.subtotal).toBe(50);
      expect(result.discountPercentage).toBe(0);
      expect(result.discount).toBe(0);
      expect(result.total).toBe(50);
    });

    it("handles zero quantity correctly", () => {
      const result = calculatePriceDetails({
        volumeCm3: 10,
        materialPrice: 5,
        quantity: 0,
      });

      expect(result.subtotal).toBe(0);
      expect(result.total).toBe(0);
    });
  });

  describe("Discount Logic", () => {
    it("applies 0% discount for quantity < 5", () => {
      const result = calculatePriceDetails({
        volumeCm3: 10,
        materialPrice: 2,
        quantity: 4,
      });

      expect(result.discountPercentage).toBe(0);
      expect(result.total).toBe(result.subtotal);
    });

    it("applies 5% discount for quantity 5", () => {
      const result = calculatePriceDetails({
        volumeCm3: 10,
        materialPrice: 10,
        quantity: 5,
      });

      expect(result.discountPercentage).toBe(0.05);
      expect(result.discount).toBe(25);
      expect(result.total).toBe(475);
    });

    it("applies 5% discount for quantity 9", () => {
      const result = calculatePriceDetails({
        volumeCm3: 1,
        materialPrice: 100,
        quantity: 9,
      });
      expect(result.discountPercentage).toBe(0.05);
    });

    it("applies 10% discount for quantity 10", () => {
      const result = calculatePriceDetails({
        volumeCm3: 10,
        materialPrice: 10,
        quantity: 10,
      });

      expect(result.discountPercentage).toBe(0.1);
      expect(result.discount).toBe(100);
      expect(result.total).toBe(900);
    });

    it("applies 15% discount for quantity 25", () => {
      const result = calculatePriceDetails({
        volumeCm3: 10,
        materialPrice: 10,
        quantity: 25,
      });

      expect(result.discountPercentage).toBe(0.15);
      expect(result.discount).toBe(375);
      expect(result.total).toBe(2125);
    });

    it("applies 20% discount for quantity 50 ", () => {
      const result = calculatePriceDetails({
        volumeCm3: 10,
        materialPrice: 10,
        quantity: 50,
      });

      expect(result.discountPercentage).toBe(0.2);
      expect(result.discount).toBe(1000);
      expect(result.total).toBe(4000);
    });

    it("applies 20% discount for extremely high quantity", () => {
      const result = calculatePriceDetails({
        volumeCm3: 1,
        materialPrice: 1,
        quantity: 9999,
      });
      expect(result.discountPercentage).toBe(0.2);
    });
  });

  describe("Precision Handling", () => {
    it("handles floating point math correctly using toBeCloseTo", () => {
      const result = calculatePriceDetails({
        volumeCm3: 10.5,
        materialPrice: 3.33,
        quantity: 15,
      });

      expect(result.unitPrice).toBeCloseTo(34.965, 4);
      expect(result.subtotal).toBeCloseTo(524.475, 4);
      expect(result.discount).toBeCloseTo(52.4475, 4);
      expect(result.total).toBeCloseTo(472.0275, 4);
    });
  });
});
