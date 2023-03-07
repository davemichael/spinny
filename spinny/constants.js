export const kMaxRows = 40;
export const kMaxCols = 40;

// The circle is embedded in the hexagon; each edge of the hexagon
// is a tangent line segment whose center is on the circle.
//          1 ^ b
//          / | \ a       ca is r long
//        /   |  /\       Lcab is a right angle
//    0 /     |r/   \     A regular hexagon is made up of 6 equilateral
//     |      |/     |    triangles, so ab is half the length of cb.
//     |      c------|a   Use the pythagorean theorem:
//     |          r  |    cb^2 = (cb/2)^2 + r^2
//    5 \           / 3   ...
//        \       /       cb = sqrt(4/3) * r
//          \   /
//            v 4
export const kHexRatio = Math.sqrt(4.0/3.0);
// The hex is made up of 6 equilateral triangles of length r * kHexRatio.
// Each hex is 2 * r * kHexRatio tall.
// When packed, hexes overlap by half a hex edge.
export const kVerticalSpacingCoefficient = 1.5 * kHexRatio;
export const kMarginCoefficient = kVerticalSpacingCoefficient - 1.0;

