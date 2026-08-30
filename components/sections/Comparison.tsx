import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Motion";
import { comparison } from "@/content/copy";

/**
 * A real semantic <table>, not styled <div> rows — every fact in it restates
 * something already established elsewhere on the site (Mohs scale, the
 * streak test, the natural-vs-hematine distinction), organised so a shopper
 * can check us against anything else sold under the same name before they
 * buy, not just take our word for it.
 */
export default function Comparison() {
  return (
    <Section className="overflow-hidden">
      <SectionHeading
        align="center"
        eyebrow={comparison.eyebrow}
        title={comparison.headline}
        body={comparison.body}
      />

      <Reveal delay={0.16} className="mt-14 overflow-x-auto rounded-(--radius-card) border border-line">
        <table className="w-full min-w-175 border-collapse text-left text-[0.85rem]">
          <thead>
            <tr className="bg-linen">
              <th scope="col" className="sticky left-0 bg-linen p-5 font-display text-[0.68rem] font-semibold tracking-[0.14em] text-ink-mute uppercase">
                &nbsp;
              </th>
              {comparison.columns.map((col, i) => (
                <th
                  key={col}
                  scope="col"
                  className={`p-5 font-display text-[0.82rem] font-bold tracking-[-0.01em] ${
                    i === 0 ? "bg-ink text-chalk" : "bg-linen text-ink"
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {comparison.rows.map((row) => (
              <tr key={row.label}>
                <th
                  scope="row"
                  className="sticky left-0 bg-parchment p-5 text-[0.78rem] font-semibold text-ink-mute"
                >
                  {row.label}
                </th>
                {row.values.map((value, i) => (
                  <td
                    key={i}
                    className={`p-5 leading-[1.5] text-pretty ${
                      i === 0 ? "bg-ink/[0.03] font-medium text-ink" : "text-ink-soft"
                    }`}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>
    </Section>
  );
}
