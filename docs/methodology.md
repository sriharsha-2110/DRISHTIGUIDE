# DRISHTIGUIDE AI — Technical Methodology

## 1. Spatial Positioning Logic
Horizontal position is computed from the bounding box centroid $x_c = \frac{x_1 + x_2}{2}$ relative to frame width $W$:
- $x_c / W < 0.33 \implies \text{LEFT}$
- $0.33 \le x_c / W \le 0.66 \implies \text{CENTER}$
- $x_c / W > 0.66 \implies \text{RIGHT}$

## 2. Approximate Distance Estimation (Prototype Heuristic)
Approximate distance uses bounding box height ratio $H_{\text{box}} / H_{\text{img}}$ and bottom coordinate $y_2 / H_{\text{img}}$:
- **VERY_NEAR**: $H_{\text{box}} / H_{\text{img}} \ge 0.45$ or $y_2 / H_{\text{img}} \ge 0.88$
- **NEAR**: $H_{\text{box}} / H_{\text{img}} \ge 0.25$ or $y_2 / H_{\text{img}} \ge 0.70$
- **MEDIUM**: $H_{\text{box}} / H_{\text{img}} \ge 0.10$
- **FAR**: $H_{\text{box}} / H_{\text{img}} < 0.10$

## 3. Temporal Tracking & Movement Classification
Centroids and bounding box areas $A = W_{\text{box}} \times H_{\text{box}}$ are stored across consecutive frames.
- $\frac{A_t}{A_{t-1}} \ge 1.20 \implies \text{APPROACHING}$
- $\frac{A_t}{A_{t-1}} \le 0.80 \implies \text{MOVING\_AWAY}$
- $|\Delta x_c| > 40\text{px} \implies \text{MOVING\_LATERALLY}$
- Else $\implies \text{STATIONARY}$

## 4. Dynamic Risk Engine Scoring (0-100)
$$\text{Risk Score} = \text{BaseHazard} \times 45 \times w_{\text{dist}} \times w_{\text{pos}} \times w_{\text{move}} \times w_{\text{path}} \times (0.8 + 0.2 \times c)$$

Risk Levels:
- $0 - 25 \implies \text{SAFE}$
- $26 - 50 \implies \text{CAUTION}$
- $51 - 75 \implies \text{HIGH}$
- $76 - 100 \implies \text{CRITICAL}$

## 5. Intelligent Guidance Priority Engine
Ranks candidates by Priority Level: $\text{CRITICAL} > \text{IMPORTANT} > \text{INFORMATION} > \text{IGNORE}$.
Applies a 4-second speech cooldown for routine guidance and duplicate phrase suppression, while allowing **CRITICAL** hazard alerts to override cooldown immediately.
