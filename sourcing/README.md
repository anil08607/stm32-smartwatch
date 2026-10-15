# Purchasing and stock

`release/full-purchase-list.csv` is the complete purchase list per watch. `assembly-bom.csv` has 70 fitted parts grouped into 40 exact SMT lines; `assembly-cpl.csv` has 70 placements. External parts and reusable tools are separate rows. M1 is purchased as a wire-lead motor and fitted after reflow.

`sourcing/stock.json` queries each exact JLCPCB component code through the public part-detail catalog and checks the normalized manufacturer part number. Available quantity is the smaller of warehouse stock and available-order quantity. The batch requirement is five boards plus max(5 pieces, 20%) attrition per line. Unknown quantities, mismatched identities, non-purchasable listings and shortages fail. Inventory is not reserved and evidence expires after 24 hours.

The original 510 kΩ listing C11616 had no orderable stock during review. R4 now specifies Yageo RC0402FR-07510KL, C137961: 510 kΩ, ±1%, 0402, 62.5 mW, 50 V. This preserves the feedback ratio and package. No value substitution was made to bypass stock.

The external-parts list names supplier/product or quote destinations. A product URL is not a stock or compatibility confirmation. The protected battery pack, harnesses, case, lens, inserts, adhesives and cable must be quoted/selected against their drawings before the complete watch can be purchased as one qualified kit. Neither JLCPCB nor any other supplier has accepted the assembly or ordered material in this session.
