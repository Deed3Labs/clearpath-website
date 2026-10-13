/* 04 · The site plan of one lot, wide (landscape) and tall (portrait, below
   620px). Ported from the mockup's markup as static drawings, with its
   drafting conventions kept as classes: poché exterior walls, thinner
   partitions, glazing as three lines in a knocked-out opening, doors as a
   leaf and a swing, a dash-dot property line, decking and pavers as light
   hatch. The three zones (front, back, workshop) light up with `zone`. */

import { HOMES } from '@/content/housing';

const P = HOMES.plan;

export function SitePlan({ zone }: { zone: number }) {
  const cz = (base: string, z: number) => (z === zone ? `${base} on` : base);
  return (
    <>
      <svg className="bp wide" viewBox="0 0 1050 476" role="img" aria-label={HOMES.planLabel}>
      <polygon className={cz("z", 0)} points="185.5,140.0 259.0,140.0 259.0,315.0 185.5,315.0"/>
      <polygon className={cz("z", 1)} points="455.0,45.5 791.0,45.5 791.0,178.5 949.2,178.5 949.2,388.5 455.0,388.5"/>
      <polygon className={cz("z", 2)} points="794.5,52.5 952.0,52.5 952.0,0.0 1036.0,0.0 1036.0,476.0 952.0,476.0 952.0,171.5 794.5,171.5"/>
      <line className="edge" x1="28.0" y1="0.0" x2="28.0" y2="476.0"/>
      <line className="pav" x1="77.0" y1="0.0" x2="77.0" y2="476.0"/>
      <line className="pav" x1="105.0" y1="0.0" x2="105.0" y2="476.0"/>
      <line className="pav" x1="77.0" y1="0.0" x2="105.0" y2="0.0"/>
      <line className="pav" x1="77.0" y1="28.0" x2="105.0" y2="28.0"/>
      <line className="pav" x1="77.0" y1="56.0" x2="105.0" y2="56.0"/>
      <line className="pav" x1="77.0" y1="84.0" x2="105.0" y2="84.0"/>
      <line className="pav" x1="77.0" y1="112.0" x2="105.0" y2="112.0"/>
      <line className="pav" x1="77.0" y1="140.0" x2="105.0" y2="140.0"/>
      <line className="pav" x1="77.0" y1="168.0" x2="105.0" y2="168.0"/>
      <line className="pav" x1="77.0" y1="196.0" x2="105.0" y2="196.0"/>
      <line className="pav" x1="77.0" y1="224.0" x2="105.0" y2="224.0"/>
      <line className="pav" x1="77.0" y1="252.0" x2="105.0" y2="252.0"/>
      <line className="pav" x1="77.0" y1="280.0" x2="105.0" y2="280.0"/>
      <line className="pav" x1="77.0" y1="308.0" x2="105.0" y2="308.0"/>
      <line className="pav" x1="77.0" y1="336.0" x2="105.0" y2="336.0"/>
      <line className="pav" x1="77.0" y1="364.0" x2="105.0" y2="364.0"/>
      <line className="pav" x1="77.0" y1="392.0" x2="105.0" y2="392.0"/>
      <line className="pav" x1="77.0" y1="420.0" x2="105.0" y2="420.0"/>
      <line className="pav" x1="77.0" y1="448.0" x2="105.0" y2="448.0"/>
      <line className="pav" x1="77.0" y1="476.0" x2="105.0" y2="476.0"/>
      <line className="edge" x1="952.0" y1="0.0" x2="952.0" y2="476.0"/>
      <line className="edge" x1="1036.0" y1="0.0" x2="1036.0" y2="476.0"/>
      <line className="cl" x1="994.0" y1="14.0" x2="994.0" y2="42.0"/>
      <line className="cl" x1="994.0" y1="70.0" x2="994.0" y2="98.0"/>
      <line className="cl" x1="994.0" y1="126.0" x2="994.0" y2="154.0"/>
      <line className="cl" x1="994.0" y1="182.0" x2="994.0" y2="210.0"/>
      <line className="cl" x1="994.0" y1="238.0" x2="994.0" y2="266.0"/>
      <line className="cl" x1="994.0" y1="294.0" x2="994.0" y2="322.0"/>
      <line className="cl" x1="994.0" y1="350.0" x2="994.0" y2="378.0"/>
      <line className="cl" x1="994.0" y1="406.0" x2="994.0" y2="434.0"/>
      <line className="cl" x1="994.0" y1="462.0" x2="994.0" y2="490.0"/>
      <rect className="pl" x="112.0" y="42.0" width="840.0" height="350.0"/>
      <line className="fence" x1="322.0" y1="44.8" x2="949.2" y2="44.8"/>
      <line className="fence" x1="322.0" y1="389.2" x2="949.2" y2="389.2"/>
      <line className="fence" x1="949.2" y1="178.5" x2="949.2" y2="389.2"/>
      <rect className="post" x="320.2" y="43.1" width="3.5" height="3.5"/>
      <rect className="post" x="320.2" y="387.4" width="3.5" height="3.5"/>
      <rect className="post" x="362.2" y="43.1" width="3.5" height="3.5"/>
      <rect className="post" x="362.2" y="387.4" width="3.5" height="3.5"/>
      <rect className="post" x="404.2" y="43.1" width="3.5" height="3.5"/>
      <rect className="post" x="404.2" y="387.4" width="3.5" height="3.5"/>
      <rect className="post" x="446.2" y="43.1" width="3.5" height="3.5"/>
      <rect className="post" x="446.2" y="387.4" width="3.5" height="3.5"/>
      <rect className="post" x="488.2" y="43.1" width="3.5" height="3.5"/>
      <rect className="post" x="488.2" y="387.4" width="3.5" height="3.5"/>
      <rect className="post" x="530.2" y="43.1" width="3.5" height="3.5"/>
      <rect className="post" x="530.2" y="387.4" width="3.5" height="3.5"/>
      <rect className="post" x="572.2" y="43.1" width="3.5" height="3.5"/>
      <rect className="post" x="572.2" y="387.4" width="3.5" height="3.5"/>
      <rect className="post" x="614.2" y="43.1" width="3.5" height="3.5"/>
      <rect className="post" x="614.2" y="387.4" width="3.5" height="3.5"/>
      <rect className="post" x="656.2" y="43.1" width="3.5" height="3.5"/>
      <rect className="post" x="656.2" y="387.4" width="3.5" height="3.5"/>
      <rect className="post" x="698.2" y="43.1" width="3.5" height="3.5"/>
      <rect className="post" x="698.2" y="387.4" width="3.5" height="3.5"/>
      <rect className="post" x="740.2" y="43.1" width="3.5" height="3.5"/>
      <rect className="post" x="740.2" y="387.4" width="3.5" height="3.5"/>
      <rect className="post" x="782.2" y="43.1" width="3.5" height="3.5"/>
      <rect className="post" x="782.2" y="387.4" width="3.5" height="3.5"/>
      <rect className="post" x="824.2" y="43.1" width="3.5" height="3.5"/>
      <rect className="post" x="824.2" y="387.4" width="3.5" height="3.5"/>
      <rect className="post" x="866.2" y="43.1" width="3.5" height="3.5"/>
      <rect className="post" x="866.2" y="387.4" width="3.5" height="3.5"/>
      <rect className="post" x="908.2" y="43.1" width="3.5" height="3.5"/>
      <rect className="post" x="908.2" y="387.4" width="3.5" height="3.5"/>
      <line className="pav" x1="112.0" y1="220.5" x2="112.0" y2="241.5"/>
      <line className="pav" x1="126.0" y1="220.5" x2="126.0" y2="241.5"/>
      <line className="pav" x1="140.0" y1="220.5" x2="140.0" y2="241.5"/>
      <line className="pav" x1="154.0" y1="220.5" x2="154.0" y2="241.5"/>
      <line className="pav" x1="168.0" y1="220.5" x2="168.0" y2="241.5"/>
      <line className="pav" x1="182.0" y1="220.5" x2="182.0" y2="241.5"/>
      <line className="pav" x1="112.0" y1="220.5" x2="185.5" y2="220.5"/>
      <line className="pav" x1="112.0" y1="241.5" x2="185.5" y2="241.5"/>
      <rect className="edge" x="185.5" y="213.5" width="17.5" height="35.0"/>
      <line className="deck" x1="194.2" y1="213.5" x2="194.2" y2="248.5"/>
      <line className="deck" x1="204.4" y1="147.0" x2="257.6" y2="147.0"/>
      <line className="deck" x1="204.4" y1="154.0" x2="257.6" y2="154.0"/>
      <line className="deck" x1="204.4" y1="161.0" x2="257.6" y2="161.0"/>
      <line className="deck" x1="204.4" y1="168.0" x2="257.6" y2="168.0"/>
      <line className="deck" x1="204.4" y1="175.0" x2="257.6" y2="175.0"/>
      <line className="deck" x1="204.4" y1="182.0" x2="257.6" y2="182.0"/>
      <line className="deck" x1="204.4" y1="189.0" x2="257.6" y2="189.0"/>
      <line className="deck" x1="204.4" y1="196.0" x2="257.6" y2="196.0"/>
      <line className="deck" x1="204.4" y1="203.0" x2="257.6" y2="203.0"/>
      <line className="deck" x1="204.4" y1="210.0" x2="257.6" y2="210.0"/>
      <line className="deck" x1="204.4" y1="217.0" x2="257.6" y2="217.0"/>
      <line className="deck" x1="204.4" y1="224.0" x2="257.6" y2="224.0"/>
      <line className="deck" x1="204.4" y1="231.0" x2="257.6" y2="231.0"/>
      <line className="deck" x1="204.4" y1="238.0" x2="257.6" y2="238.0"/>
      <line className="deck" x1="204.4" y1="245.0" x2="257.6" y2="245.0"/>
      <line className="deck" x1="204.4" y1="252.0" x2="257.6" y2="252.0"/>
      <line className="deck" x1="204.4" y1="259.0" x2="257.6" y2="259.0"/>
      <line className="deck" x1="204.4" y1="266.0" x2="257.6" y2="266.0"/>
      <line className="deck" x1="204.4" y1="273.0" x2="257.6" y2="273.0"/>
      <line className="deck" x1="204.4" y1="280.0" x2="257.6" y2="280.0"/>
      <line className="deck" x1="204.4" y1="287.0" x2="257.6" y2="287.0"/>
      <line className="deck" x1="204.4" y1="294.0" x2="257.6" y2="294.0"/>
      <line className="deck" x1="204.4" y1="301.0" x2="257.6" y2="301.0"/>
      <line className="deck" x1="204.4" y1="308.0" x2="257.6" y2="308.0"/>
      <rect className="edge" x="203.0" y="140.0" width="56.0" height="175.0"/>
      <rect className="postb" x="204.4" y="141.4" width="3.5" height="3.5"/>
      <rect className="postb" x="204.4" y="310.1" width="3.5" height="3.5"/>
      <rect className="postb" x="204.4" y="226.8" width="3.5" height="3.5"/>
      <line className="deck" x1="456.4" y1="140.0" x2="509.6" y2="140.0"/>
      <line className="deck" x1="456.4" y1="147.0" x2="509.6" y2="147.0"/>
      <line className="deck" x1="456.4" y1="154.0" x2="509.6" y2="154.0"/>
      <line className="deck" x1="456.4" y1="161.0" x2="509.6" y2="161.0"/>
      <line className="deck" x1="456.4" y1="168.0" x2="509.6" y2="168.0"/>
      <line className="deck" x1="456.4" y1="175.0" x2="509.6" y2="175.0"/>
      <line className="deck" x1="456.4" y1="182.0" x2="509.6" y2="182.0"/>
      <line className="deck" x1="456.4" y1="189.0" x2="509.6" y2="189.0"/>
      <line className="deck" x1="456.4" y1="196.0" x2="509.6" y2="196.0"/>
      <line className="deck" x1="456.4" y1="203.0" x2="509.6" y2="203.0"/>
      <line className="deck" x1="456.4" y1="210.0" x2="509.6" y2="210.0"/>
      <line className="deck" x1="456.4" y1="217.0" x2="509.6" y2="217.0"/>
      <line className="deck" x1="456.4" y1="224.0" x2="509.6" y2="224.0"/>
      <line className="deck" x1="456.4" y1="231.0" x2="509.6" y2="231.0"/>
      <line className="deck" x1="456.4" y1="238.0" x2="509.6" y2="238.0"/>
      <line className="deck" x1="456.4" y1="245.0" x2="509.6" y2="245.0"/>
      <line className="deck" x1="456.4" y1="252.0" x2="509.6" y2="252.0"/>
      <line className="deck" x1="456.4" y1="259.0" x2="509.6" y2="259.0"/>
      <line className="deck" x1="456.4" y1="266.0" x2="509.6" y2="266.0"/>
      <line className="deck" x1="456.4" y1="273.0" x2="509.6" y2="273.0"/>
      <line className="deck" x1="456.4" y1="280.0" x2="509.6" y2="280.0"/>
      <line className="deck" x1="456.4" y1="287.0" x2="509.6" y2="287.0"/>
      <line className="deck" x1="456.4" y1="294.0" x2="509.6" y2="294.0"/>
      <line className="deck" x1="456.4" y1="301.0" x2="509.6" y2="301.0"/>
      <line className="deck" x1="456.4" y1="308.0" x2="509.6" y2="308.0"/>
      <line className="deck" x1="456.4" y1="315.0" x2="509.6" y2="315.0"/>
      <line className="deck" x1="456.4" y1="322.0" x2="509.6" y2="322.0"/>
      <line className="deck" x1="456.4" y1="329.0" x2="509.6" y2="329.0"/>
      <line className="deck" x1="456.4" y1="336.0" x2="509.6" y2="336.0"/>
      <rect className="edge" x="455.0" y="133.0" width="56.0" height="210.0"/>
      <rect className="postb" x="506.1" y="134.4" width="3.5" height="3.5"/>
      <rect className="postb" x="506.1" y="338.1" width="3.5" height="3.5"/>
      <rect className="postb" x="506.1" y="236.6" width="3.5" height="3.5"/>
      <line className="pav" x1="511.0" y1="161.0" x2="511.0" y2="315.0"/>
      <line className="pav" x1="525.0" y1="161.0" x2="525.0" y2="315.0"/>
      <line className="pav" x1="539.0" y1="161.0" x2="539.0" y2="315.0"/>
      <line className="pav" x1="553.0" y1="161.0" x2="553.0" y2="315.0"/>
      <line className="pav" x1="567.0" y1="161.0" x2="567.0" y2="315.0"/>
      <line className="pav" x1="581.0" y1="161.0" x2="581.0" y2="315.0"/>
      <line className="pav" x1="511.0" y1="161.0" x2="581.0" y2="161.0"/>
      <line className="pav" x1="511.0" y1="175.0" x2="581.0" y2="175.0"/>
      <line className="pav" x1="511.0" y1="189.0" x2="581.0" y2="189.0"/>
      <line className="pav" x1="511.0" y1="203.0" x2="581.0" y2="203.0"/>
      <line className="pav" x1="511.0" y1="217.0" x2="581.0" y2="217.0"/>
      <line className="pav" x1="511.0" y1="231.0" x2="581.0" y2="231.0"/>
      <line className="pav" x1="511.0" y1="245.0" x2="581.0" y2="245.0"/>
      <line className="pav" x1="511.0" y1="259.0" x2="581.0" y2="259.0"/>
      <line className="pav" x1="511.0" y1="273.0" x2="581.0" y2="273.0"/>
      <line className="pav" x1="511.0" y1="287.0" x2="581.0" y2="287.0"/>
      <line className="pav" x1="511.0" y1="301.0" x2="581.0" y2="301.0"/>
      <line className="pav" x1="511.0" y1="315.0" x2="581.0" y2="315.0"/>
      <rect className="edge" x="511.0" y="161.0" width="70.0" height="154.0"/>
      <rect className="edge" x="602.0" y="210.0" width="15.4" height="9.8"/>
      <rect className="edge" x="637.0" y="199.5" width="15.4" height="9.8"/>
      <rect className="edge" x="672.0" y="192.5" width="15.4" height="9.8"/>
      <rect className="edge" x="707.0" y="189.0" width="15.4" height="9.8"/>
      <rect className="edge" x="742.0" y="186.9" width="15.4" height="9.8"/>
      <rect className="edge" x="777.0" y="186.2" width="15.4" height="9.8"/>
      <rect className="wall" x="259.0" y="112.0" width="196.0" height="231.0"/>
      <line className="iw" x1="343.0" y1="112.0" x2="343.0" y2="122.5"/>
      <line className="iw" x1="343.0" y1="140.0" x2="343.0" y2="189.0"/>
      <line className="iw" x1="343.0" y1="266.0" x2="343.0" y2="315.0"/>
      <line className="iw" x1="343.0" y1="332.5" x2="343.0" y2="343.0"/>
      <line className="iw" x1="259.0" y1="189.0" x2="320.6" y2="189.0"/>
      <line className="iw" x1="339.5" y1="189.0" x2="343.0" y2="189.0"/>
      <line className="iw" x1="259.0" y1="266.0" x2="320.6" y2="266.0"/>
      <line className="iw" x1="339.5" y1="266.0" x2="343.0" y2="266.0"/>
      <line className="iw" x1="378.0" y1="112.0" x2="378.0" y2="168.0"/>
      <line className="iw" x1="343.0" y1="168.0" x2="378.0" y2="168.0"/>
      <line className="iw" x1="378.0" y1="287.0" x2="378.0" y2="343.0"/>
      <line className="iw" x1="343.0" y1="287.0" x2="378.0" y2="287.0"/>
      <rect className="ko" x="256.6" y="129.5" width="4.9" height="38.5"/>
      <line className="win" x1="257.2" y1="129.5" x2="257.2" y2="168.0"/>
      <line className="win" x1="260.8" y1="129.5" x2="260.8" y2="168.0"/>
      <line className="win" x1="259.0" y1="129.5" x2="259.0" y2="168.0"/>
      <rect className="ko" x="256.6" y="287.0" width="4.9" height="38.5"/>
      <line className="win" x1="257.2" y1="287.0" x2="257.2" y2="325.5"/>
      <line className="win" x1="260.8" y1="287.0" x2="260.8" y2="325.5"/>
      <line className="win" x1="259.0" y1="287.0" x2="259.0" y2="325.5"/>
      <rect className="ko" x="280.0" y="109.5" width="42.0" height="4.9"/>
      <line className="win" x1="280.0" y1="110.2" x2="322.0" y2="110.2"/>
      <line className="win" x1="280.0" y1="113.8" x2="322.0" y2="113.8"/>
      <line className="win" x1="280.0" y1="112.0" x2="322.0" y2="112.0"/>
      <rect className="ko" x="399.0" y="109.5" width="35.0" height="4.9"/>
      <line className="win" x1="399.0" y1="110.2" x2="434.0" y2="110.2"/>
      <line className="win" x1="399.0" y1="113.8" x2="434.0" y2="113.8"/>
      <line className="win" x1="399.0" y1="112.0" x2="434.0" y2="112.0"/>
      <rect className="ko" x="280.0" y="340.6" width="42.0" height="4.9"/>
      <line className="win" x1="280.0" y1="341.2" x2="322.0" y2="341.2"/>
      <line className="win" x1="280.0" y1="344.8" x2="322.0" y2="344.8"/>
      <line className="win" x1="280.0" y1="343.0" x2="322.0" y2="343.0"/>
      <rect className="ko" x="399.0" y="340.6" width="35.0" height="4.9"/>
      <line className="win" x1="399.0" y1="341.2" x2="434.0" y2="341.2"/>
      <line className="win" x1="399.0" y1="344.8" x2="434.0" y2="344.8"/>
      <line className="win" x1="399.0" y1="343.0" x2="434.0" y2="343.0"/>
      <rect className="ko" x="256.2" y="220.5" width="5.6" height="21.0"/>
      <line className="door" x1="259.0" y1="220.5" x2="280.0" y2="220.5"/>
      <path className="arc" d="M280.0 220.5 A21.0 21.0 0 0 1 259.0 241.5"/>
      <rect className="ko" x="452.2" y="210.0" width="5.6" height="84.0"/>
      <line className="door" x1="453.6" y1="210.0" x2="453.6" y2="254.8"/>
      <line className="door" x1="456.4" y1="249.2" x2="456.4" y2="294.0"/>
      <line className="door" x1="339.5" y1="189.0" x2="339.5" y2="170.1"/>
      <path className="arc" d="M339.5 170.1 A18.9 18.9 0 0 0 320.6 189.0"/>
      <line className="door" x1="339.5" y1="266.0" x2="339.5" y2="284.9"/>
      <path className="arc" d="M339.5 284.9 A18.9 18.9 0 0 1 320.6 266.0"/>
      <line className="door" x1="343.0" y1="140.0" x2="360.5" y2="140.0"/>
      <path className="arc" d="M360.5 140.0 A17.5 17.5 0 0 0 343.0 122.5"/>
      <line className="door" x1="343.0" y1="315.0" x2="360.5" y2="315.0"/>
      <path className="arc" d="M360.5 315.0 A17.5 17.5 0 0 1 343.0 332.5"/>
      <rect className="fx" x="380.8" y="114.1" width="71.4" height="14.7"/>
      <circle className="fx" cx="423.5" cy="121.5" r="4.2"/>
      <rect className="fx" x="392.0" y="116.2" width="11.2" height="10.5"/>
      <rect className="fx" x="399.0" y="148.4" width="38.5" height="16.8"/>
      <circle className="fx" cx="416.5" cy="199.5" r="13.3"/>
      <rect className="fx" x="345.8" y="114.8" width="29.4" height="17.5"/>
      <rect className="fx" x="345.8" y="322.7" width="29.4" height="17.5"/>
      <rect className="fx" x="365.4" y="150.5" width="9.8" height="14.7"/>
      <rect className="fx" x="365.4" y="289.8" width="9.8" height="14.7"/>
      <rect className="wall" x="798.0" y="56.0" width="140.0" height="112.0"/>
      <rect className="ko" x="935.2" y="70.0" width="5.6" height="84.0"/>
      <line className="oh" x1="931.0" y1="70.0" x2="931.0" y2="154.0"/>
      <rect className="ko" x="819.0" y="165.2" width="21.0" height="5.6"/>
      <line className="door" x1="819.0" y1="168.0" x2="819.0" y2="189.0"/>
      <path className="arc" d="M819.0 189.0 A21.0 21.0 0 0 0 840.0 168.0"/>
      <rect className="pav" x="938.0" y="70.0" width="14.0" height="84.0"/>
      <circle className="tree" cx="143.5" cy="84.0" r="25.2"/>
      <circle className="post" cx="143.5" cy="84.0" r="2.4"/>
      <circle className="tree" cx="143.5" cy="353.5" r="22.4"/>
      <circle className="post" cx="143.5" cy="353.5" r="2.4"/>
      <circle className="tree" cx="672.0" cy="343.0" r="37.8"/>
      <circle className="post" cx="672.0" cy="343.0" r="2.4"/>
      <circle className="tree" cx="728.0" cy="105.0" r="29.4"/>
      <circle className="post" cx="728.0" cy="105.0" r="2.4"/>
      <line className="dim" x1="259.0" y1="87.5" x2="455.0" y2="87.5"/>
      <line className="dimk" x1="254.8" y1="91.7" x2="263.2" y2="83.3"/>
      <line className="dim" x1="259.0" y1="80.5" x2="259.0" y2="94.5"/>
      <line className="dimk" x1="450.8" y1="91.7" x2="459.2" y2="83.3"/>
      <line className="dim" x1="455.0" y1="80.5" x2="455.0" y2="94.5"/>
      <text className="t d" x="357.0" y="81.2" textAnchor="middle">{P.width}</text>
      <line className="dim" x1="175.0" y1="112.0" x2="175.0" y2="343.0"/>
      <line className="dimk" x1="170.8" y1="116.2" x2="179.2" y2="107.8"/>
      <line className="dim" x1="168.0" y1="112.0" x2="182.0" y2="112.0"/>
      <line className="dimk" x1="170.8" y1="347.2" x2="179.2" y2="338.8"/>
      <line className="dim" x1="168.0" y1="343.0" x2="182.0" y2="343.0"/>
      <text className="t d" x="168.7" y="168.0" textAnchor="middle" transform="rotate(-90 168.7 168.0)">{P.depth}</text>
      <line className="dim" x1="112.0" y1="409.5" x2="952.0" y2="409.5"/>
      <line className="dimk" x1="107.8" y1="413.7" x2="116.2" y2="405.3"/>
      <line className="dim" x1="112.0" y1="402.5" x2="112.0" y2="416.5"/>
      <line className="dimk" x1="947.8" y1="413.7" x2="956.2" y2="405.3"/>
      <line className="dim" x1="952.0" y1="402.5" x2="952.0" y2="416.5"/>
      <text className="t d" x="532.0" y="424.2" textAnchor="middle">{P.lot}</text>
      <text className="t" x="301.0" y="150.5" textAnchor="middle">{P.bed1}</text>
      <text className="t s" x="301.0" y="163.8" textAnchor="middle">{P.bedSize}</text>
      <text className="t" x="301.0" y="227.5" textAnchor="middle">{P.parlor}</text>
      <text className="t" x="301.0" y="304.5" textAnchor="middle">{P.bed2}</text>
      <text className="t s" x="301.0" y="317.8" textAnchor="middle">{P.bedSize}</text>
      <text className="t s" x="360.5" y="149.8" textAnchor="middle">{P.bath}</text>
      <text className="t s" x="360.5" y="308.0" textAnchor="middle">{P.bath}</text>
      <text className="t" x="420.0" y="259.0" textAnchor="middle">{P.living}</text>
      <text className="t s" x="420.0" y="272.3" textAnchor="middle">{P.livingSize}</text>
      <text className="t s" x="420.0" y="179.2" textAnchor="middle">{P.kitchen}</text>
      <text className={cz("t zl", 0)} x="235.2" y="227.5" textAnchor="middle" transform="rotate(-90 235.2 227.5)">{P.front}</text>
      <text className={cz("t zl", 1)} x="487.2" y="238.0" textAnchor="middle" transform="rotate(-90 487.2 238.0)">{P.rear}</text>
      <text className="t s" x="546.0" y="151.2" textAnchor="middle">{P.patio}</text>
      <text className={cz("t zl", 1)} x="700.0" y="273.0" textAnchor="middle">{P.yard}</text>
      <text className={cz("t zl", 2)} x="868.0" y="108.5" textAnchor="middle">{P.workshop}</text>
      <text className="t s" x="868.0" y="121.8" textAnchor="middle">{P.workshopSize}</text>
      <text className={cz("t zl", 2)} x="994.0" y="252.0" textAnchor="middle" transform="rotate(-90 994.0 252.0)">{P.drive}</text>
      <text className="t" x="52.5" y="252.0" textAnchor="middle" transform="rotate(-90 52.5 252.0)">{P.street}</text>
      <rect className="sbf" x="728.0" y="430.5" width="35.0" height="7.0"/>
      <rect className="sbo" x="763.0" y="430.5" width="35.0" height="7.0"/>
      <rect className="sbf" x="798.0" y="430.5" width="70.0" height="7.0"/>
      <text className="t s" x="728.0" y="455.0" textAnchor="middle">{P.scale[0]}</text>
      <text className="t s" x="763.0" y="455.0" textAnchor="middle">{P.scale[1]}</text>
      <text className="t s" x="798.0" y="455.0" textAnchor="middle">{P.scale[2]}</text>
      <text className="t s" x="868.0" y="455.0" textAnchor="middle">{P.scale[3]}</text>
      <text className="t s" x="903.0" y="455.0" textAnchor="start">{P.scale[4]}</text>
      <circle className="edge" cx="672.0" cy="435.4" r="15.4"/>
      <polygon className="na" points="665.0,441.7 687.4,435.4 665.0,429.1"/>
      <text className="t" x="700.0" y="441.7" textAnchor="start">{P.north}</text>
      <text className="t s" x="112.0" y="441.0" textAnchor="start">{P.caption}</text>
      </svg>
      <svg className="bp tall" viewBox="0 0 476 1050" role="img" aria-label={HOMES.planLabel}>
      <polygon className={cz("z", 0)} points="140.0,864.5 140.0,791.0 315.0,791.0 315.0,864.5"/>
      <polygon className={cz("z", 1)} points="45.5,595.0 45.5,259.0 178.5,259.0 178.5,100.8 388.5,100.8 388.5,595.0"/>
      <polygon className={cz("z", 2)} points="52.5,255.5 52.5,98.0 0.0,98.0 0.0,14.0 476.0,14.0 476.0,98.0 171.5,98.0 171.5,255.5"/>
      <line className="edge" x1="0.0" y1="1022.0" x2="476.0" y2="1022.0"/>
      <line className="pav" x1="0.0" y1="973.0" x2="476.0" y2="973.0"/>
      <line className="pav" x1="0.0" y1="945.0" x2="476.0" y2="945.0"/>
      <line className="pav" x1="0.0" y1="973.0" x2="0.0" y2="945.0"/>
      <line className="pav" x1="28.0" y1="973.0" x2="28.0" y2="945.0"/>
      <line className="pav" x1="56.0" y1="973.0" x2="56.0" y2="945.0"/>
      <line className="pav" x1="84.0" y1="973.0" x2="84.0" y2="945.0"/>
      <line className="pav" x1="112.0" y1="973.0" x2="112.0" y2="945.0"/>
      <line className="pav" x1="140.0" y1="973.0" x2="140.0" y2="945.0"/>
      <line className="pav" x1="168.0" y1="973.0" x2="168.0" y2="945.0"/>
      <line className="pav" x1="196.0" y1="973.0" x2="196.0" y2="945.0"/>
      <line className="pav" x1="224.0" y1="973.0" x2="224.0" y2="945.0"/>
      <line className="pav" x1="252.0" y1="973.0" x2="252.0" y2="945.0"/>
      <line className="pav" x1="280.0" y1="973.0" x2="280.0" y2="945.0"/>
      <line className="pav" x1="308.0" y1="973.0" x2="308.0" y2="945.0"/>
      <line className="pav" x1="336.0" y1="973.0" x2="336.0" y2="945.0"/>
      <line className="pav" x1="364.0" y1="973.0" x2="364.0" y2="945.0"/>
      <line className="pav" x1="392.0" y1="973.0" x2="392.0" y2="945.0"/>
      <line className="pav" x1="420.0" y1="973.0" x2="420.0" y2="945.0"/>
      <line className="pav" x1="448.0" y1="973.0" x2="448.0" y2="945.0"/>
      <line className="pav" x1="476.0" y1="973.0" x2="476.0" y2="945.0"/>
      <line className="edge" x1="0.0" y1="98.0" x2="476.0" y2="98.0"/>
      <line className="edge" x1="0.0" y1="14.0" x2="476.0" y2="14.0"/>
      <line className="cl" x1="14.0" y1="56.0" x2="42.0" y2="56.0"/>
      <line className="cl" x1="70.0" y1="56.0" x2="98.0" y2="56.0"/>
      <line className="cl" x1="126.0" y1="56.0" x2="154.0" y2="56.0"/>
      <line className="cl" x1="182.0" y1="56.0" x2="210.0" y2="56.0"/>
      <line className="cl" x1="238.0" y1="56.0" x2="266.0" y2="56.0"/>
      <line className="cl" x1="294.0" y1="56.0" x2="322.0" y2="56.0"/>
      <line className="cl" x1="350.0" y1="56.0" x2="378.0" y2="56.0"/>
      <line className="cl" x1="406.0" y1="56.0" x2="434.0" y2="56.0"/>
      <line className="cl" x1="462.0" y1="56.0" x2="490.0" y2="56.0"/>
      <rect className="pl" x="42.0" y="98.0" width="350.0" height="840.0"/>
      <line className="fence" x1="44.8" y1="728.0" x2="44.8" y2="100.8"/>
      <line className="fence" x1="389.2" y1="728.0" x2="389.2" y2="100.8"/>
      <line className="fence" x1="178.5" y1="100.8" x2="389.2" y2="100.8"/>
      <rect className="post" x="43.1" y="726.2" width="3.5" height="3.5"/>
      <rect className="post" x="387.4" y="726.2" width="3.5" height="3.5"/>
      <rect className="post" x="43.1" y="684.2" width="3.5" height="3.5"/>
      <rect className="post" x="387.4" y="684.2" width="3.5" height="3.5"/>
      <rect className="post" x="43.1" y="642.2" width="3.5" height="3.5"/>
      <rect className="post" x="387.4" y="642.2" width="3.5" height="3.5"/>
      <rect className="post" x="43.1" y="600.2" width="3.5" height="3.5"/>
      <rect className="post" x="387.4" y="600.2" width="3.5" height="3.5"/>
      <rect className="post" x="43.1" y="558.2" width="3.5" height="3.5"/>
      <rect className="post" x="387.4" y="558.2" width="3.5" height="3.5"/>
      <rect className="post" x="43.1" y="516.2" width="3.5" height="3.5"/>
      <rect className="post" x="387.4" y="516.2" width="3.5" height="3.5"/>
      <rect className="post" x="43.1" y="474.2" width="3.5" height="3.5"/>
      <rect className="post" x="387.4" y="474.2" width="3.5" height="3.5"/>
      <rect className="post" x="43.1" y="432.2" width="3.5" height="3.5"/>
      <rect className="post" x="387.4" y="432.2" width="3.5" height="3.5"/>
      <rect className="post" x="43.1" y="390.2" width="3.5" height="3.5"/>
      <rect className="post" x="387.4" y="390.2" width="3.5" height="3.5"/>
      <rect className="post" x="43.1" y="348.2" width="3.5" height="3.5"/>
      <rect className="post" x="387.4" y="348.2" width="3.5" height="3.5"/>
      <rect className="post" x="43.1" y="306.2" width="3.5" height="3.5"/>
      <rect className="post" x="387.4" y="306.2" width="3.5" height="3.5"/>
      <rect className="post" x="43.1" y="264.2" width="3.5" height="3.5"/>
      <rect className="post" x="387.4" y="264.2" width="3.5" height="3.5"/>
      <rect className="post" x="43.1" y="222.2" width="3.5" height="3.5"/>
      <rect className="post" x="387.4" y="222.2" width="3.5" height="3.5"/>
      <rect className="post" x="43.1" y="180.2" width="3.5" height="3.5"/>
      <rect className="post" x="387.4" y="180.2" width="3.5" height="3.5"/>
      <rect className="post" x="43.1" y="138.2" width="3.5" height="3.5"/>
      <rect className="post" x="387.4" y="138.2" width="3.5" height="3.5"/>
      <line className="pav" x1="220.5" y1="938.0" x2="241.5" y2="938.0"/>
      <line className="pav" x1="220.5" y1="924.0" x2="241.5" y2="924.0"/>
      <line className="pav" x1="220.5" y1="910.0" x2="241.5" y2="910.0"/>
      <line className="pav" x1="220.5" y1="896.0" x2="241.5" y2="896.0"/>
      <line className="pav" x1="220.5" y1="882.0" x2="241.5" y2="882.0"/>
      <line className="pav" x1="220.5" y1="868.0" x2="241.5" y2="868.0"/>
      <line className="pav" x1="220.5" y1="938.0" x2="220.5" y2="864.5"/>
      <line className="pav" x1="241.5" y1="938.0" x2="241.5" y2="864.5"/>
      <rect className="edge" x="213.5" y="847.0" width="35.0" height="17.5"/>
      <line className="deck" x1="213.5" y1="855.8" x2="248.5" y2="855.8"/>
      <line className="deck" x1="147.0" y1="845.6" x2="147.0" y2="792.4"/>
      <line className="deck" x1="154.0" y1="845.6" x2="154.0" y2="792.4"/>
      <line className="deck" x1="161.0" y1="845.6" x2="161.0" y2="792.4"/>
      <line className="deck" x1="168.0" y1="845.6" x2="168.0" y2="792.4"/>
      <line className="deck" x1="175.0" y1="845.6" x2="175.0" y2="792.4"/>
      <line className="deck" x1="182.0" y1="845.6" x2="182.0" y2="792.4"/>
      <line className="deck" x1="189.0" y1="845.6" x2="189.0" y2="792.4"/>
      <line className="deck" x1="196.0" y1="845.6" x2="196.0" y2="792.4"/>
      <line className="deck" x1="203.0" y1="845.6" x2="203.0" y2="792.4"/>
      <line className="deck" x1="210.0" y1="845.6" x2="210.0" y2="792.4"/>
      <line className="deck" x1="217.0" y1="845.6" x2="217.0" y2="792.4"/>
      <line className="deck" x1="224.0" y1="845.6" x2="224.0" y2="792.4"/>
      <line className="deck" x1="231.0" y1="845.6" x2="231.0" y2="792.4"/>
      <line className="deck" x1="238.0" y1="845.6" x2="238.0" y2="792.4"/>
      <line className="deck" x1="245.0" y1="845.6" x2="245.0" y2="792.4"/>
      <line className="deck" x1="252.0" y1="845.6" x2="252.0" y2="792.4"/>
      <line className="deck" x1="259.0" y1="845.6" x2="259.0" y2="792.4"/>
      <line className="deck" x1="266.0" y1="845.6" x2="266.0" y2="792.4"/>
      <line className="deck" x1="273.0" y1="845.6" x2="273.0" y2="792.4"/>
      <line className="deck" x1="280.0" y1="845.6" x2="280.0" y2="792.4"/>
      <line className="deck" x1="287.0" y1="845.6" x2="287.0" y2="792.4"/>
      <line className="deck" x1="294.0" y1="845.6" x2="294.0" y2="792.4"/>
      <line className="deck" x1="301.0" y1="845.6" x2="301.0" y2="792.4"/>
      <line className="deck" x1="308.0" y1="845.6" x2="308.0" y2="792.4"/>
      <rect className="edge" x="140.0" y="791.0" width="175.0" height="56.0"/>
      <rect className="postb" x="141.4" y="842.1" width="3.5" height="3.5"/>
      <rect className="postb" x="310.1" y="842.1" width="3.5" height="3.5"/>
      <rect className="postb" x="226.8" y="842.1" width="3.5" height="3.5"/>
      <line className="deck" x1="140.0" y1="593.6" x2="140.0" y2="540.4"/>
      <line className="deck" x1="147.0" y1="593.6" x2="147.0" y2="540.4"/>
      <line className="deck" x1="154.0" y1="593.6" x2="154.0" y2="540.4"/>
      <line className="deck" x1="161.0" y1="593.6" x2="161.0" y2="540.4"/>
      <line className="deck" x1="168.0" y1="593.6" x2="168.0" y2="540.4"/>
      <line className="deck" x1="175.0" y1="593.6" x2="175.0" y2="540.4"/>
      <line className="deck" x1="182.0" y1="593.6" x2="182.0" y2="540.4"/>
      <line className="deck" x1="189.0" y1="593.6" x2="189.0" y2="540.4"/>
      <line className="deck" x1="196.0" y1="593.6" x2="196.0" y2="540.4"/>
      <line className="deck" x1="203.0" y1="593.6" x2="203.0" y2="540.4"/>
      <line className="deck" x1="210.0" y1="593.6" x2="210.0" y2="540.4"/>
      <line className="deck" x1="217.0" y1="593.6" x2="217.0" y2="540.4"/>
      <line className="deck" x1="224.0" y1="593.6" x2="224.0" y2="540.4"/>
      <line className="deck" x1="231.0" y1="593.6" x2="231.0" y2="540.4"/>
      <line className="deck" x1="238.0" y1="593.6" x2="238.0" y2="540.4"/>
      <line className="deck" x1="245.0" y1="593.6" x2="245.0" y2="540.4"/>
      <line className="deck" x1="252.0" y1="593.6" x2="252.0" y2="540.4"/>
      <line className="deck" x1="259.0" y1="593.6" x2="259.0" y2="540.4"/>
      <line className="deck" x1="266.0" y1="593.6" x2="266.0" y2="540.4"/>
      <line className="deck" x1="273.0" y1="593.6" x2="273.0" y2="540.4"/>
      <line className="deck" x1="280.0" y1="593.6" x2="280.0" y2="540.4"/>
      <line className="deck" x1="287.0" y1="593.6" x2="287.0" y2="540.4"/>
      <line className="deck" x1="294.0" y1="593.6" x2="294.0" y2="540.4"/>
      <line className="deck" x1="301.0" y1="593.6" x2="301.0" y2="540.4"/>
      <line className="deck" x1="308.0" y1="593.6" x2="308.0" y2="540.4"/>
      <line className="deck" x1="315.0" y1="593.6" x2="315.0" y2="540.4"/>
      <line className="deck" x1="322.0" y1="593.6" x2="322.0" y2="540.4"/>
      <line className="deck" x1="329.0" y1="593.6" x2="329.0" y2="540.4"/>
      <line className="deck" x1="336.0" y1="593.6" x2="336.0" y2="540.4"/>
      <rect className="edge" x="133.0" y="539.0" width="210.0" height="56.0"/>
      <rect className="postb" x="134.4" y="540.4" width="3.5" height="3.5"/>
      <rect className="postb" x="338.1" y="540.4" width="3.5" height="3.5"/>
      <rect className="postb" x="236.6" y="540.4" width="3.5" height="3.5"/>
      <line className="pav" x1="161.0" y1="539.0" x2="315.0" y2="539.0"/>
      <line className="pav" x1="161.0" y1="525.0" x2="315.0" y2="525.0"/>
      <line className="pav" x1="161.0" y1="511.0" x2="315.0" y2="511.0"/>
      <line className="pav" x1="161.0" y1="497.0" x2="315.0" y2="497.0"/>
      <line className="pav" x1="161.0" y1="483.0" x2="315.0" y2="483.0"/>
      <line className="pav" x1="161.0" y1="469.0" x2="315.0" y2="469.0"/>
      <line className="pav" x1="161.0" y1="539.0" x2="161.0" y2="469.0"/>
      <line className="pav" x1="175.0" y1="539.0" x2="175.0" y2="469.0"/>
      <line className="pav" x1="189.0" y1="539.0" x2="189.0" y2="469.0"/>
      <line className="pav" x1="203.0" y1="539.0" x2="203.0" y2="469.0"/>
      <line className="pav" x1="217.0" y1="539.0" x2="217.0" y2="469.0"/>
      <line className="pav" x1="231.0" y1="539.0" x2="231.0" y2="469.0"/>
      <line className="pav" x1="245.0" y1="539.0" x2="245.0" y2="469.0"/>
      <line className="pav" x1="259.0" y1="539.0" x2="259.0" y2="469.0"/>
      <line className="pav" x1="273.0" y1="539.0" x2="273.0" y2="469.0"/>
      <line className="pav" x1="287.0" y1="539.0" x2="287.0" y2="469.0"/>
      <line className="pav" x1="301.0" y1="539.0" x2="301.0" y2="469.0"/>
      <line className="pav" x1="315.0" y1="539.0" x2="315.0" y2="469.0"/>
      <rect className="edge" x="161.0" y="469.0" width="154.0" height="70.0"/>
      <rect className="edge" x="210.0" y="432.6" width="9.8" height="15.4"/>
      <rect className="edge" x="199.5" y="397.6" width="9.8" height="15.4"/>
      <rect className="edge" x="192.5" y="362.6" width="9.8" height="15.4"/>
      <rect className="edge" x="189.0" y="327.6" width="9.8" height="15.4"/>
      <rect className="edge" x="186.9" y="292.6" width="9.8" height="15.4"/>
      <rect className="edge" x="186.2" y="257.6" width="9.8" height="15.4"/>
      <rect className="wall" x="112.0" y="595.0" width="231.0" height="196.0"/>
      <line className="iw" x1="112.0" y1="707.0" x2="122.5" y2="707.0"/>
      <line className="iw" x1="140.0" y1="707.0" x2="189.0" y2="707.0"/>
      <line className="iw" x1="266.0" y1="707.0" x2="315.0" y2="707.0"/>
      <line className="iw" x1="332.5" y1="707.0" x2="343.0" y2="707.0"/>
      <line className="iw" x1="189.0" y1="791.0" x2="189.0" y2="729.4"/>
      <line className="iw" x1="189.0" y1="710.5" x2="189.0" y2="707.0"/>
      <line className="iw" x1="266.0" y1="791.0" x2="266.0" y2="729.4"/>
      <line className="iw" x1="266.0" y1="710.5" x2="266.0" y2="707.0"/>
      <line className="iw" x1="112.0" y1="672.0" x2="168.0" y2="672.0"/>
      <line className="iw" x1="168.0" y1="707.0" x2="168.0" y2="672.0"/>
      <line className="iw" x1="287.0" y1="672.0" x2="343.0" y2="672.0"/>
      <line className="iw" x1="287.0" y1="707.0" x2="287.0" y2="672.0"/>
      <rect className="ko" x="129.5" y="788.6" width="38.5" height="4.9"/>
      <line className="win" x1="129.5" y1="792.8" x2="168.0" y2="792.8"/>
      <line className="win" x1="129.5" y1="789.2" x2="168.0" y2="789.2"/>
      <line className="win" x1="129.5" y1="791.0" x2="168.0" y2="791.0"/>
      <rect className="ko" x="287.0" y="788.6" width="38.5" height="4.9"/>
      <line className="win" x1="287.0" y1="792.8" x2="325.5" y2="792.8"/>
      <line className="win" x1="287.0" y1="789.2" x2="325.5" y2="789.2"/>
      <line className="win" x1="287.0" y1="791.0" x2="325.5" y2="791.0"/>
      <rect className="ko" x="109.5" y="728.0" width="4.9" height="42.0"/>
      <line className="win" x1="110.2" y1="770.0" x2="110.2" y2="728.0"/>
      <line className="win" x1="113.8" y1="770.0" x2="113.8" y2="728.0"/>
      <line className="win" x1="112.0" y1="770.0" x2="112.0" y2="728.0"/>
      <rect className="ko" x="109.5" y="616.0" width="4.9" height="35.0"/>
      <line className="win" x1="110.2" y1="651.0" x2="110.2" y2="616.0"/>
      <line className="win" x1="113.8" y1="651.0" x2="113.8" y2="616.0"/>
      <line className="win" x1="112.0" y1="651.0" x2="112.0" y2="616.0"/>
      <rect className="ko" x="340.6" y="728.0" width="4.9" height="42.0"/>
      <line className="win" x1="341.2" y1="770.0" x2="341.2" y2="728.0"/>
      <line className="win" x1="344.8" y1="770.0" x2="344.8" y2="728.0"/>
      <line className="win" x1="343.0" y1="770.0" x2="343.0" y2="728.0"/>
      <rect className="ko" x="340.6" y="616.0" width="4.9" height="35.0"/>
      <line className="win" x1="341.2" y1="651.0" x2="341.2" y2="616.0"/>
      <line className="win" x1="344.8" y1="651.0" x2="344.8" y2="616.0"/>
      <line className="win" x1="343.0" y1="651.0" x2="343.0" y2="616.0"/>
      <rect className="ko" x="220.5" y="788.2" width="21.0" height="5.6"/>
      <line className="door" x1="220.5" y1="791.0" x2="220.5" y2="770.0"/>
      <path className="arc" d="M220.5 770.0 A21.0 21.0 0 0 1 241.5 791.0"/>
      <rect className="ko" x="210.0" y="592.2" width="84.0" height="5.6"/>
      <line className="door" x1="210.0" y1="596.4" x2="254.8" y2="596.4"/>
      <line className="door" x1="249.2" y1="593.6" x2="294.0" y2="593.6"/>
      <line className="door" x1="189.0" y1="710.5" x2="170.1" y2="710.5"/>
      <path className="arc" d="M170.1 710.5 A18.9 18.9 0 0 0 189.0 729.4"/>
      <line className="door" x1="266.0" y1="710.5" x2="284.9" y2="710.5"/>
      <path className="arc" d="M284.9 710.5 A18.9 18.9 0 0 1 266.0 729.4"/>
      <line className="door" x1="140.0" y1="707.0" x2="140.0" y2="689.5"/>
      <path className="arc" d="M140.0 689.5 A17.5 17.5 0 0 0 122.5 707.0"/>
      <line className="door" x1="315.0" y1="707.0" x2="315.0" y2="689.5"/>
      <path className="arc" d="M315.0 689.5 A17.5 17.5 0 0 1 332.5 707.0"/>
      <rect className="fx" x="114.1" y="597.8" width="14.7" height="71.4"/>
      <circle className="fx" cx="121.5" cy="626.5" r="4.2"/>
      <rect className="fx" x="116.2" y="646.8" width="10.5" height="11.2"/>
      <rect className="fx" x="148.4" y="612.5" width="16.8" height="38.5"/>
      <circle className="fx" cx="199.5" cy="633.5" r="13.3"/>
      <rect className="fx" x="114.8" y="674.8" width="17.5" height="29.4"/>
      <rect className="fx" x="322.7" y="674.8" width="17.5" height="29.4"/>
      <rect className="fx" x="150.5" y="674.8" width="14.7" height="9.8"/>
      <rect className="fx" x="289.8" y="674.8" width="14.7" height="9.8"/>
      <rect className="wall" x="56.0" y="112.0" width="112.0" height="140.0"/>
      <rect className="ko" x="70.0" y="109.2" width="84.0" height="5.6"/>
      <line className="oh" x1="70.0" y1="119.0" x2="154.0" y2="119.0"/>
      <rect className="ko" x="165.2" y="210.0" width="5.6" height="21.0"/>
      <line className="door" x1="168.0" y1="231.0" x2="189.0" y2="231.0"/>
      <path className="arc" d="M189.0 231.0 A21.0 21.0 0 0 0 168.0 210.0"/>
      <rect className="pav" x="70.0" y="98.0" width="84.0" height="14.0"/>
      <circle className="tree" cx="84.0" cy="906.5" r="25.2"/>
      <circle className="post" cx="84.0" cy="906.5" r="2.4"/>
      <circle className="tree" cx="353.5" cy="906.5" r="22.4"/>
      <circle className="post" cx="353.5" cy="906.5" r="2.4"/>
      <circle className="tree" cx="343.0" cy="378.0" r="37.8"/>
      <circle className="post" cx="343.0" cy="378.0" r="2.4"/>
      <circle className="tree" cx="105.0" cy="322.0" r="29.4"/>
      <circle className="post" cx="105.0" cy="322.0" r="2.4"/>
      <line className="dim" x1="87.5" y1="791.0" x2="87.5" y2="595.0"/>
      <line className="dimk" x1="91.7" y1="795.2" x2="83.3" y2="786.8"/>
      <line className="dim" x1="80.5" y1="791.0" x2="94.5" y2="791.0"/>
      <line className="dimk" x1="91.7" y1="599.2" x2="83.3" y2="590.8"/>
      <line className="dim" x1="80.5" y1="595.0" x2="94.5" y2="595.0"/>
      <text className="t d" x="81.2" y="693.0" textAnchor="middle">{P.width}</text>
      <line className="dim" x1="112.0" y1="875.0" x2="343.0" y2="875.0"/>
      <line className="dimk" x1="116.2" y1="879.2" x2="107.8" y2="870.8"/>
      <line className="dim" x1="112.0" y1="882.0" x2="112.0" y2="868.0"/>
      <line className="dimk" x1="347.2" y1="879.2" x2="338.8" y2="870.8"/>
      <line className="dim" x1="343.0" y1="882.0" x2="343.0" y2="868.0"/>
      <text className="t d" x="168.0" y="881.3" textAnchor="middle">{P.depth}</text>
      <text className="t" x="150.5" y="749.0" textAnchor="middle">{P.bed1}</text>
      <text className="t s" x="150.5" y="762.3" textAnchor="middle">{P.bedSize}</text>
      <text className="t" x="232.4" y="749.0" textAnchor="middle">{P.parlor}</text>
      <text className="t" x="304.5" y="749.0" textAnchor="middle">{P.bed2}</text>
      <text className="t s" x="304.5" y="762.3" textAnchor="middle">{P.bedSize}</text>
      <text className="t s" x="149.8" y="689.5" textAnchor="middle">{P.bath}</text>
      <text className="t s" x="308.0" y="689.5" textAnchor="middle">{P.bath}</text>
      <text className="t" x="259.0" y="630.0" textAnchor="middle">{P.living}</text>
      <text className="t s" x="259.0" y="643.3" textAnchor="middle">{P.livingSize}</text>
      <text className={cz("t zl", 0)} x="227.5" y="814.8" textAnchor="middle">{P.front}</text>
      <text className={cz("t zl", 1)} x="238.0" y="562.8" textAnchor="middle">{P.rear}</text>
      <text className="t s" x="151.2" y="504.0" textAnchor="middle">{P.patio}</text>
      <text className={cz("t zl", 1)} x="273.0" y="350.0" textAnchor="middle">{P.yard}</text>
      <text className={cz("t zl", 2)} x="108.5" y="182.0" textAnchor="middle">{P.workshop}</text>
      <text className="t s" x="108.5" y="195.3" textAnchor="middle">{P.workshopSize}</text>
      <text className={cz("t zl", 2)} x="252.0" y="56.0" textAnchor="middle">{P.drive}</text>
      <text className="t" x="252.0" y="997.5" textAnchor="middle">{P.street}</text>
      </svg>
    </>
  );
}
