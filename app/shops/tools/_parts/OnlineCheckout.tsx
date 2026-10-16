import { Device, Screen, Mark } from '@/components/system';
import { ONLINE } from '@/content/shopsTools';

/* The shop's own catering checkout with Clear's modal on top: a browser on a
   desk (760 × 520), and on a phone (390 × 720) the shop's page under Clear's
   bottom sheet. The shop's page is drawn in its own colours, not Clear's. */

const M = ONLINE.modal;
const C = ONLINE.checkout;

function ModalHead() {
  return (
    <div className="mh">
      <i>{M.initials}</i>
      <b>{M.shop}</b>
      <strong>{M.amount}</strong>
      <span aria-hidden="true">{M.close}</span>
    </div>
  );
}

function Secured() {
  return (
    <div className="sec2">
      <Mark />
      {M.secured}
    </div>
  );
}

export function OnlineCheckout() {
  return (
    <Device>
      <Screen w={760} h={520} variant="desk" className="paperish" canvasClassName="brw">
        <div className="bar">
          <i />
          <i />
          <i />
          <span className="u">{C.url}</span>
        </div>
        <div className="site">
          <div>
            <h4>{C.title}</h4>
            <p>{C.when}</p>
            <div className="ol">
              {C.lines.map((l) => (
                <div key={l.k}>
                  <span>{l.k}</span>
                  <span>{l.v}</span>
                </div>
              ))}
              <div className="g">
                <span>{C.total.k}</span>
                <span>{C.total.v}</span>
              </div>
            </div>
          </div>
          <div>
            <div className="sbtn">{C.button}</div>
            <p className="sbn">{C.buttonNote}</p>
          </div>
        </div>
        <div className="shade" />
        <div className="pwm">
          <ModalHead />
          <div className="mb">
            <h5>{M.title}</h5>
            <p>{M.text}</p>
            <div className="fld">
              <span>{M.field.label}</span>
              <b>{M.field.value}</b>
            </div>
            <span className="b1">{M.go}</span>
            <span className="or">{M.or}</span>
            <span className="b2">{M.card}</span>
          </div>
          <Secured />
        </div>
      </Screen>

      <Screen w={390} h={720} variant="phone" className="paperish" canvasClassName="php">
        <div className="top3">
          <i>{M.initials}</i>
          {M.shop}
        </div>
        <div className="pg2">
          <h4>{C.title}</h4>
          <p className="t">{C.phone.summary}</p>
          <p className="t">
            <b>{C.phone.total}</b>
          </p>
        </div>
        <div className="sh2" />
        <div className="sheet2">
          <div className="pwm">
            <ModalHead />
            <div className="mb">
              <h5>{M.title}</h5>
              <p>{M.phone.text}</p>
              <span className="b1">{M.phone.approve}</span>
              <span className="b2">{M.phone.other}</span>
              <span className="or">{M.or}</span>
              <span className="b2">{M.card}</span>
            </div>
            <Secured />
          </div>
        </div>
      </Screen>
    </Device>
  );
}
