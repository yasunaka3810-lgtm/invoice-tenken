const EGOV_CTA = 'https://laws.e-gov.go.jp/law/363AC0000000108';
const EGOV_CTA_ORDER = 'https://laws.e-gov.go.jp/law/363CO0000000360';
const NTA_OVERVIEW = 'https://www.nta.go.jp/taxes/shiraberu/zeimokubetsu/shohi/keigenzeiritsu/pdf/0020006-027.pdf';
const DENCHO_QA = 'https://www.nta.go.jp/law/joho-zeikaishaku/sonota/jirei/pdf/0026007-006_05.pdf';
const cta = { en: 'Consumption Tax Act', ja: '消費税法' };
const ctaOrder = { en: 'Order for Enforcement of the Consumption Tax Act', ja: '消費税法施行令' };
const overview = {
    en: 'NTA, "Overview of the Qualified Invoice System" (April 2026 edition)',
    ja: '国税庁「適格請求書等保存方式の概要」（令和8年4月）',
};
const denchoQa = {
    en: 'NTA, "Electronic Bookkeeping Act Q&A — Electronic Transactions" (July 2026)',
    ja: '国税庁「電子帳簿保存法一問一答【電子取引関係】」（令和8年7月）',
};
const list = [
    { id: 'CTA_57_4_1', title: cta, locator: { en: 'Art. 57-4(1)', ja: '第57条の4第1項' }, url: EGOV_CTA },
    { id: 'CTA_57_4_2', title: cta, locator: { en: 'Art. 57-4(2)', ja: '第57条の4第2項' }, url: EGOV_CTA },
    { id: 'CTA_57_4_3', title: cta, locator: { en: 'Art. 57-4(3)', ja: '第57条の4第3項' }, url: EGOV_CTA },
    {
        id: 'ORDER_70_9_3',
        title: ctaOrder,
        locator: { en: 'Art. 70-9(3)(ii)', ja: '第70条の9第3項第2号' },
        url: EGOV_CTA_ORDER,
    },
    { id: 'ORDER_70_10', title: ctaOrder, locator: { en: 'Art. 70-10', ja: '第70条の10' }, url: EGOV_CTA_ORDER },
    { id: 'ORDER_70_11', title: ctaOrder, locator: { en: 'Art. 70-11', ja: '第70条の11' }, url: EGOV_CTA_ORDER },
    { id: 'NTA_OVERVIEW_P4', title: overview, locator: { en: 'p. 4 (required items)', ja: 'P4（記載事項）' }, url: NTA_OVERVIEW },
    {
        id: 'NTA_OVERVIEW_P6',
        title: overview,
        locator: { en: 'p. 6 (several documents together; registration number shared by a code table)', ja: 'P6（複数の書類による対応・登録番号を取引先コード表で共有する場合）' },
        url: NTA_OVERVIEW,
    },
    {
        id: 'NTA_OVERVIEW_P7',
        title: overview,
        locator: { en: 'p. 7 (rounding of the tax amount)', ja: 'P7（「税率ごとに区分した消費税額等」の端数処理）' },
        url: NTA_OVERVIEW,
    },
    {
        id: 'NTA_OVERVIEW_P8',
        title: overview,
        locator: { en: 'p. 8 (qualified return invoices)', ja: 'P8（適格返還請求書の記載事項等）' },
        url: NTA_OVERVIEW,
    },
    {
        id: 'NTA_INVOICE_QA_73',
        title: {
            en: 'NTA, "Q&A on the Qualified Invoice System" (rev. May 2026)',
            ja: '国税庁「消費税の仕入税額控除制度における適格請求書等保存方式に関するＱ＆Ａ」（令和8年5月改訂）',
        },
        locator: { en: 'Q73 (how to show reduced-rate items)', ja: '問73（軽減対象課税資産の譲渡等である旨の記載方法）' },
        url: 'https://www.nta.go.jp/taxes/shiraberu/zeimokubetsu/shohi/keigenzeiritsu/pdf/qa/01-09.pdf',
    },
    {
        id: 'NTA_REGNO',
        title: { en: 'NTA Invoice Publication Site, "What is a registration number"', ja: '国税庁 適格請求書発行事業者公表サイト「登録番号とは」' },
        locator: { en: 'composition of the number', ja: '登録番号の構成' },
        url: 'https://www.invoice-kohyo.nta.go.jp/about-toroku/index.html',
    },
    {
        id: 'CORP_NO_CHECK',
        title: { en: 'NTA, "Composition of the Corporate Number"', ja: '国税庁「法人番号の構成」' },
        locator: {
            en: 'check digit formula (Ministerial Ordinance on Designation of Corporate Numbers, Art. 2)',
            ja: '検査用数字の算式（法人番号の指定等に関する省令 第2条）',
        },
        url: 'https://www.houjin-bangou.nta.go.jp/documents/houjinbangounokousei.pdf',
    },
    { id: 'DENCHO_Q48', title: denchoQa, locator: { en: 'Q48 (search functions)', ja: '問48（検索機能）' }, url: DENCHO_QA },
    {
        id: 'DENCHO_Q50',
        title: denchoQa,
        locator: { en: 'Q50 (file names with date, amount and counterparty)', ja: '問50（ファイル名に日付・金額・取引先を入れる方法）' },
        url: DENCHO_QA,
    },
    { id: 'DENCHO_Q51', title: denchoQa, locator: { en: 'Q51 (sales of 50 million yen or less)', ja: '問51（売上高5,000万円以下の判定）' }, url: DENCHO_QA },
    { id: 'DENCHO_Q54', title: denchoQa, locator: { en: 'Q54 (one PDF with several invoices)', ja: '問54（複数の請求書を含むPDF）' }, url: DENCHO_QA },
    { id: 'DENCHO_Q55', title: denchoQa, locator: { en: 'Q55 (monthly statements)', ja: '問55（1か月分をまとめた書類の日付と金額）' }, url: DENCHO_QA },
    { id: 'DENCHO_Q57', title: denchoQa, locator: { en: 'Q57 (amount with or without tax)', ja: '問57（取引金額は税抜・税込のどちらか）' }, url: DENCHO_QA },
    {
        id: 'WEBAPI_TERMS_6',
        title: { en: 'NTA Invoice Publication System Web-API Terms of Use', ja: '適格請求書発行事業者公表システムWeb-API機能利用規約' },
        locator: { en: 'Art. 6 (source attribution)', ja: '第6条（情報の取得元の明示）' },
        url: 'https://www.invoice-kohyo.nta.go.jp/web-api/riyou_kiyaku.html',
    },
    {
        id: 'WEBAPI_SPEC',
        title: {
            en: 'NTA Invoice Publication System Web-API specification, Part 2 (Ver. 1.0)',
            ja: '適格請求書発行事業者公表システムWeb-API機能 第二編（Ver.1.0）',
        },
        locator: { en: 'request format and response items', ja: 'リクエストの設定方法と提供データ' },
        url: 'https://www.invoice-kohyo.nta.go.jp/files/k-web-api-kinou.pdf',
    },
];
const byId = new Map(list.map((s) => [s.id, s]));
export function cite(lang, ...ids) {
    return ids.map((id) => {
        const s = byId.get(id);
        if (!s)
            throw new Error(`unknown source id: ${id}`);
        return { id, title: s.title[lang], locator: s.locator[lang], url: s.url };
    });
}
export function allSources() {
    return list;
}
/** Attribution that Art. 6 of the Web-API terms requires on any service that uses the API. */
export const NTA_ATTRIBUTION_JA = 'このサービスは、適格請求書発行事業者公表システムWeb-API機能を利用して取得した情報をもとに作成しているが、サービスの内容は国税庁によって保証されたものではない';
