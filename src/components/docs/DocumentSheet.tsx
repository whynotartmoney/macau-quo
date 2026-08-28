import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { STYLE_LIST } from '../../data/styles';
import {
  amountToChinese,
  computeTotals,
  currencyName,
  docNumber,
  formatDate,
  formatMoney,
  lineAmount,
} from '../../lib/money';
import type { DocData, DocType, LayoutCustom, Party, StyleId } from '../../types/doc';

const LABELS: Record<DocType, { zh: string; en: string }> = {
  quotation: { zh: '報價單', en: 'Quotation' },
  invoice: { zh: '發票', en: 'Invoice' },
  receipt: { zh: '收據', en: 'Receipt' },
};

function LogoImg({ src, scale }: { src: string; scale: number }) {
  const h = Math.round(44 * Math.max(0.4, Math.min(2.5, (Number(scale) || 100) / 100)));
  return <img className="sheet-logo" src={src} alt="" style={{ height: h, width: 'auto', maxHeight: 'none' }} />;
}

function chopBox(naturalW: number, naturalH: number, size: number) {
  const ratio = (naturalW || 1) / (naturalH || 1);
  if (ratio >= 1) return { w: size, h: Math.max(1, Math.round(size / ratio)) };
  return { w: Math.max(1, Math.round(size * ratio)), h: size };
}

function ChopMark({
  src,
  size,
  x,
  y,
  fallback,
}: {
  src: string;
  size: number;
  x: number;
  y: number;
  fallback: string;
}) {
  const [box, setBox] = useState(() => {
    if (!src) return { w: size, h: size };
    const img = new Image();
    img.src = src;
    if (img.complete && img.naturalWidth) return chopBox(img.naturalWidth, img.naturalHeight, size);
    return { w: size, h: size };
  });

  useEffect(() => {
    if (!src) {
      setBox({ w: size, h: size });
      return;
    }
    const img = new Image();
    const apply = () => setBox(chopBox(img.naturalWidth, img.naturalHeight, size));
    img.onload = apply;
    img.src = src;
    if (img.complete && img.naturalWidth) apply();
  }, [src, size]);

  return (
    <div
      className="sheet-chop"
      style={{
        width: box.w,
        height: src ? box.h : size,
        left: x,
        bottom: -y,
      }}
    >
      {src ? (
        <img src={src} alt="" width={box.w} height={box.h} style={{ width: box.w, height: box.h }} />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
}

function PartyBlock({
  label,
  party,
}: {
  label: string;
  party: Party;
}) {
  return (
    <div>
      <div className="sheet-party-label">{label}</div>
      <div className="sheet-party-name">{party.name || '—'}</div>
      {party.nameSecondary && <div className="sheet-party-sub">{party.nameSecondary}</div>}
      <div style={{ marginTop: 6, whiteSpace: 'pre-line' }}>{party.address}</div>
      <div>{party.phone}</div>
      <div>{party.email}</div>
      {party.registrationNo && <div>商業登記 {party.registrationNo}</div>}
      {party.taxNo && <div>納稅人編號 {party.taxNo}</div>}
    </div>
  );
}

function ItemsTable({
  data,
  bilingual,
}: {
  data: DocData;
  bilingual: boolean;
}) {
  const renderRow = (head: boolean, key: string, cells: ReactNode) => (
    <div className={`sheet-row${head ? ' is-head' : ''}`} key={key}>
      <div className="sheet-row-gap is-top">
        <span className="sheet-row-gap-fill" />
      </div>
      <div className="sheet-row-body">{cells}</div>
      <div className="sheet-row-gap is-bot">
        <span className="sheet-row-gap-fill" />
      </div>
      <div className="sheet-row-rule">
        <span className="sheet-row-rule-fill" />
      </div>
    </div>
  );

  return (
    <div className="sheet-table">
      {renderRow(
        true,
        'head',
        <>
          <div className="sheet-cell is-item">{bilingual ? '項目 Description' : '項目'}</div>
          <div className="sheet-cell is-qty">數量</div>
          <div className="sheet-cell is-num">單價</div>
          <div className="sheet-cell is-num">金額</div>
        </>,
      )}
      {data.items.map((item, index) => {
        const details = (item.details || []).map((row) => row.trim()).filter(Boolean);
        return renderRow(
          false,
          item.id,
          <>
            <div className="sheet-cell is-item">
              <div className="sheet-item">
                <div className="sheet-item-num">{index + 1}.</div>
                <div className="sheet-item-body">
                  <div>{item.description || '—'}</div>
                  {details.length > 0 && (
                    <div className="sheet-item-details">
                      {details.map((row, detailIndex) => (
                        <div key={`${item.id}-${detailIndex}`}>{row}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="sheet-cell is-qty">{item.quantity || 0}</div>
            <div className="sheet-cell is-num">{formatMoney(Number(item.unitPrice) || 0, data.currency)}</div>
            <div className="sheet-cell is-num">{formatMoney(lineAmount(item), data.currency)}</div>
          </>,
        );
      })}
    </div>
  );
}

function TotalsAndNotes({
  data,
  docType,
  showChineseAmount,
}: {
  data: DocData;
  docType: DocType;
  showChineseAmount: boolean;
}) {
  const totals = computeTotals(data.items, data.discount, data.discountType, data.taxRate);
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 28, alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {showChineseAmount && (
          <div className="sheet-words">
            金額大寫：{amountToChinese(totals.total, currencyName(data.currency))}
          </div>
        )}
        {docType === 'receipt' && (
          <div style={{ marginTop: 10, fontSize: 12 }}>收款方式：{data.paymentMethod || '—'}</div>
        )}
        {data.notes && (
          <div className="sheet-notes" style={{ marginTop: 14 }}>
            <div className="sheet-party-label">備註</div>
            <div style={{ whiteSpace: 'pre-line' }}>{data.notes}</div>
          </div>
        )}
        {docType !== 'receipt' && data.paymentTerms && (
          <div className="sheet-notes" style={{ marginTop: 10 }}>
            <div className="sheet-party-label">付款條件</div>
            <div>{data.paymentTerms}</div>
          </div>
        )}
        {docType === 'invoice' && data.bankInfo && (
          <div className="sheet-notes" style={{ marginTop: 10 }}>
            <div className="sheet-party-label">轉賬資料</div>
            <div>{data.bankInfo}</div>
          </div>
        )}
      </div>
      <div className="sheet-totals">
        <div className="sheet-tot">
          <span>小計</span>
          <span>{formatMoney(totals.subtotal, data.currency)}</span>
        </div>
        {totals.discountValue > 0 && (
          <div className="sheet-tot">
            <span>折扣{data.discountType === 'percent' ? ` ${data.discount}%` : ''}</span>
            <span>-{formatMoney(totals.discountValue, data.currency)}</span>
          </div>
        )}
        {data.taxRate > 0 && (
          <div className="sheet-tot">
            <span>稅項 {data.taxRate}%</span>
            <span>{formatMoney(totals.tax, data.currency)}</span>
          </div>
        )}
        <div className="sheet-tot sheet-tot-grand">
          <span>{docType === 'receipt' ? '實收' : docType === 'invoice' ? '應付' : '合計'}</span>
          <span>{formatMoney(totals.total, data.currency)}</span>
        </div>
      </div>
    </div>
  );
}

function SignFooter({
  data,
  docType,
  number,
  showChop,
}: {
  data: DocData;
  docType: DocType;
  number: string;
  showChop: boolean;
}) {
  const chopSize = Math.round(88 * Math.max(0.4, Math.min(2.5, (Number(data.chopScale) || 100) / 100)));
  return (
    <>
      <div className="sheet-sign">
        <div>
          <div className="sheet-sign-space">
            {showChop && (
              <ChopMark
                src={data.chopDataUrl}
                size={chopSize}
                x={data.chopX || 0}
                y={data.chopY || 0}
                fallback={docType === 'receipt' ? '收款印' : '公司印章'}
              />
            )}
          </div>
          <div className="sheet-sign-line">發出方簽署 / 蓋章</div>
        </div>
        {docType !== 'receipt' && (
          <div>
            <div className="sheet-sign-space" />
            <div className="sheet-sign-line">
              {docType === 'quotation' ? '客戶確認' : '收件確認'}
            </div>
          </div>
        )}
      </div>
      <footer className="sheet-footer">
        <span>
          {data.seller.name}
          {data.seller.registrationNo ? `  ·  登記 ${data.seller.registrationNo}` : ''}
        </span>
        <span>{number}</span>
      </footer>
    </>
  );
}

type Props = {
  data: DocData;
  docType: DocType;
  styleId: StyleId;
  custom: LayoutCustom;
};

export default function DocumentSheet({ data, docType, styleId, custom }: Props) {
  const meta = STYLE_LIST.find((s) => s.id === styleId) || STYLE_LIST[0];
  const labels = LABELS[docType];
  const totals = computeTotals(data.items, data.discount, data.discountType, data.taxRate);
  const bilingual = custom.bilingual;
  const number = docNumber(data.seriesId, docType);
  const paper = custom.paper || meta.paper;
  const ink = custom.ink || meta.ink;
  const accent = custom.accent || meta.accent;
  const fontPreset = styleId === 'custom' || custom.fontPreset !== 'sans' ? custom.fontPreset : undefined;
  const dateLine =
    docType === 'quotation'
      ? custom.showValidUntil
        ? `有效期至：${formatDate(data.validUntil)}`
        : ''
      : docType === 'invoice'
        ? `付款期限：${formatDate(data.dueDate)}`
        : `收款日期：${formatDate(data.issueDate)}`;
  const enTitle = bilingual ? labels.en : '';
  const buyerLabel =
    docType === 'receipt'
      ? bilingual ? 'Received from / 付款方' : '付款方'
      : bilingual ? 'Bill to / 客戶' : '客戶';
  const sellerLabel = bilingual ? 'From / 發出方' : '發出方';

  const cssVars = { '--paper': paper, '--ink': ink, '--accent': accent } as CSSProperties;

  const logo = data.logoDataUrl ? <LogoImg src={data.logoDataUrl} scale={data.logoScale} /> : null;

  const metaLines = (
    <div className="sheet-meta">
      <div>編號：<b>{number}</b></div>
      <div>日期：{formatDate(data.issueDate)}</div>
      {dateLine ? (
        <div className={docType === 'quotation' ? 'sheet-meta-valid' : undefined}>{dateLine}</div>
      ) : null}
    </div>
  );

  const body = (
    <>
      <ItemsTable data={data} bilingual={bilingual} />
      <TotalsAndNotes data={data} docType={docType} showChineseAmount={custom.showChineseAmount} />
      <SignFooter data={data} docType={docType} number={number} showChop={custom.showChop} />
    </>
  );

  const parties = (
    <div className="sheet-parties" style={{ marginBottom: 22 }}>
      <PartyBlock label={sellerLabel} party={data.seller} />
      <PartyBlock label={buyerLabel} party={data.buyer} />
    </div>
  );

  const titleBlock = (
    <>
      {enTitle ? <div className="sheet-kicker">{enTitle}</div> : null}
      <div className="sheet-title">{labels.zh}</div>
    </>
  );

  if (styleId === 'sidebar') {
    return (
      <article className={`sheet sheet-sidebar sheet-density-${custom.density} ${fontPreset ? `sheet-font-${fontPreset}` : ''}`} style={cssVars}>
        <aside className="rail">
          {logo}
          {enTitle ? <div className="sheet-kicker" style={{ marginTop: logo ? 18 : 0 }}>{enTitle}</div> : null}
          <div className="sheet-party-name" style={{ margin: '8px 0 16px' }}>{data.seller.name}</div>
          <div className="muted" style={{ whiteSpace: 'pre-line' }}>{data.seller.address}</div>
          <div className="muted" style={{ marginTop: 8 }}>{data.seller.phone}</div>
          <div className="muted">{data.seller.email}</div>
          <div style={{ marginTop: 28 }}>{metaLines}</div>
          <div className="rail-total">
            <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.85 }}>
              {bilingual ? 'Total' : '合計'}
            </div>
            <div style={{ fontSize: 18, marginTop: 4 }}>{formatMoney(totals.total, data.currency)}</div>
          </div>
        </aside>
        <div className="sheet-inner">
          <div className="sheet-title" style={{ marginBottom: 18 }}>{labels.zh}</div>
          {parties}
          {body}
        </div>
      </article>
    );
  }

  if (styleId === 'executive') {
    return (
      <article className={`sheet sheet-executive ${fontPreset ? `sheet-font-${fontPreset}` : ''}`} style={cssVars}>
        <div className="exec-bar">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, alignItems: 'flex-start' }}>
            <div>
              {logo}
              {titleBlock}
            </div>
            {metaLines}
          </div>
        </div>
        <div className="sheet-inner">
          {parties}
          {body}
        </div>
      </article>
    );
  }

  if (styleId === 'bold') {
    return (
      <article className={`sheet sheet-bold ${fontPreset ? `sheet-font-${fontPreset}` : ''}`} style={cssVars}>
        <div className="bold-stripe" />
        <div className="bold-band">
          <div>
            {logo}
            <div className="sheet-title">{labels.zh}</div>
            {enTitle ? <div className="sheet-kicker" style={{ color: '#a3a3a3', marginTop: 4 }}>{enTitle}</div> : null}
          </div>
          {metaLines}
        </div>
        <div className="sheet-inner">
          {parties}
          {body}
        </div>
      </article>
    );
  }

  if (styleId === 'navy' || styleId === 'emerald') {
    return (
      <article className={`sheet sheet-${styleId} ${fontPreset ? `sheet-font-${fontPreset}` : ''}`} style={cssVars}>
        <div className="navy-bar">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, alignItems: 'flex-start' }}>
            <div>
              {logo}
              {titleBlock}
            </div>
            {metaLines}
          </div>
        </div>
        <div className="sheet-inner">
          {parties}
          {body}
        </div>
      </article>
    );
  }

  if (styleId === 'clean' || styleId === 'custom') {
    return (
      <article
        className={[
          'sheet',
          `sheet-${styleId}`,
          `sheet-density-${custom.density}`,
          fontPreset ? `sheet-font-${fontPreset}` : '',
        ].join(' ')}
        style={cssVars}
      >
        <div className="sheet-inner">
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
            <div>
              {logo}
              <div className="sheet-title" style={{ marginTop: logo ? 10 : 0 }}>{data.seller.name}</div>
              <div className="sheet-party-sub">{data.seller.address}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="badge-title">{labels.zh}</div>
              {enTitle ? <div className="sheet-kicker" style={{ marginTop: 8 }}>{enTitle}</div> : null}
            </div>
          </header>
          <div className="info-cards" style={{ marginBottom: 22 }}>
            <div className="info-card">
              <div className="sheet-party-label">{buyerLabel}</div>
              <div style={{ fontWeight: 600 }}>{data.buyer.name}</div>
              <div className="sheet-party-sub">{data.buyer.address}</div>
            </div>
            <div className="info-card">
              <div className="sheet-party-label">單據</div>
              {metaLines}
            </div>
            <div className="info-card">
              <div className="sheet-party-label">付款</div>
              <div>{data.paymentTerms || '—'}</div>
            </div>
          </div>
          {body}
        </div>
      </article>
    );
  }

  return (
    <article
      className={[
        'sheet',
        `sheet-${styleId}`,
        `sheet-density-${custom.density}`,
        fontPreset ? `sheet-font-${fontPreset}` : '',
        `sheet-layout-${custom.layout}`,
        `sheet-header-${custom.headerAlign}`,
      ].join(' ')}
      style={cssVars}
    >
      <div className="sheet-inner">
        <header className="sheet-head" style={{ marginBottom: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
          <div>
            {logo}
            {titleBlock}
          </div>
          {metaLines}
        </header>
        {parties}
        {body}
      </div>
    </article>
  );
}

