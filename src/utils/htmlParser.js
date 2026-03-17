export const parseHtmlLabel = (htmlLabel) => {
    if (!htmlLabel) return '';

    return htmlLabel
        .replace(/<B>/g, '<strong>')
        .replace(/<\/B>/g, '</strong>')
        .replace(/<BR\/>/g, '<br/>')
        .replace(/<I>/g, '<em>')
        .replace(/<\/I>/g, '</em>')
        .replace(/<U>/g, '<u>')
        .replace(/<\/U>/g, '</u>');
};

export const createPlaceHtmlLabel = (placeId, tokens = []) => {
    let html = `<strong>${placeId}</strong><br/>`;
    if (tokens.length > 0) {
        html += tokens.join('<br/>') + '<br/>';
    }
    return html;
};