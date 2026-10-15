# Third-party software and technical sources

The circuit's factual pinout and electrical constraints follow the manufacturer documents listed in REFERENCES.md. This repository uses the open-source tscircuit toolchain; exact runtime dependency versions are in package.json and bun.lock.

The bundled schematic-placement checker is distributed under the license retained at checks/vendor/LICENSE. Its exact bytes are SHA-256 bound in routing/binding.json. It was obtained from the tscircuit schematic-placement-analysis browser distribution on 2026-10-15.

The generated mechanical viewer bundles Three.js. Its MIT license and copyright notice are retained at mechanical/THREE-LICENSE.txt. JSCAD generates the mechanical solids; its dependency license remains distributed with the installed package. Manufacturer CAD/data URLs in component imports retain their original supplier identities.

No third-party product board files are bundled as this design.
