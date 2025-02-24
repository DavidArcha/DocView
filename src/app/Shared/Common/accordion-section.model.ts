export interface AccordionSection {
  id: string;
  label: string;
  children: AccordionSection[];
}