from typing import Dict

import numpy as np


class MonteCarloService:
    @staticmethod
    def run_retirement_simulation(
        current_savings: float,
        monthly_contribution: float,
        years_to_retirement: int,
        retirement_duration_years: int,
        desired_annual_income: float,
        expected_return_mean: float = 0.07,
        expected_return_std: float = 0.15,
        inflation_mean: float = 0.025,
        inflation_std: float = 0.01,
        iterations: int = 1000
    ) -> Dict:
        """
        Run a Monte Carlo simulation for retirement success probability.
        """
        results = []

        for _ in range(iterations):
            balance = current_savings
            cumulative_inflation = 1.0
            success = True
            path = []

            # 1. Accumulation Phase
            for year in range(years_to_retirement):
                # Annual return with volatility
                annual_return = np.random.normal(expected_return_mean, expected_return_std)
                # Annual inflation
                annual_inflation = np.random.normal(inflation_mean, inflation_std)
                cumulative_inflation *= (1 + annual_inflation)

                # Update balance
                balance = balance * (1 + annual_return) + (monthly_contribution * 12)
                path.append(balance)

            # 2. Decumulation Phase
            for year in range(retirement_duration_years):
                annual_return = np.random.normal(expected_return_mean * 0.8, expected_return_std * 0.5) # More conservative in retirement
                annual_inflation = np.random.normal(inflation_mean, inflation_std)
                cumulative_inflation *= (1 + annual_inflation)

                # Adjust withdrawal for cumulative inflation
                withdrawal = desired_annual_income * cumulative_inflation

                balance = balance * (1 + annual_return) - withdrawal
                path.append(max(0, balance))

                if balance <= 0:
                    success = False
                    break

            results.append({
                "success": success,
                "final_balance": max(0, balance),
                "path": path
            })

        success_count = sum(1 for r in results if r["success"])
        success_rate = success_count / iterations

        # Calculate percentiles for paths
        all_paths = [r["path"] for r in results]
        max_len = max(len(p) for p in all_paths)

        # Pad paths that ended early
        padded_paths = []
        for p in all_paths:
            padded_paths.append(p + [0] * (max_len - len(p)))

        path_array = np.array(padded_paths)

        percentiles = {
            "p10": np.percentile(path_array, 10, axis=0).tolist(),
            "p50": np.percentile(path_array, 50, axis=0).tolist(),
            "p90": np.percentile(path_array, 90, axis=0).tolist(),
        }

        return {
            "success_rate": success_rate,
            "iterations": iterations,
            "percentiles": percentiles,
            "years": list(range(max_len))
        }
