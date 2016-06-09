import Store from './Store';

function buildDomainRegExp(domain) {
  if (domain[0] === '.') {
    domain = '([a-z]*\.|(\.)?)?' + domain.substring(1).replace(/\./g, '\.');
  } else {
    domain = domain.replace(/\./g, '\.');
  }

  return '^' + domain + '$';
}

export default class DomainStore extends Store {
  getIdPredicate(item) {
    return x => {
      if (item.id) {
        return item.id === x.id;
      }

      return item.domain.match(x.domainRegExp) !== null && x.name === item.name
    };
  }

  set(item) {
    // Build a regexp so that that we can use to match
    // against cookie hosts such as ".domain.com".
    item.domainRegExp = buildDomainRegExp(item.domain);

    super.set(item);
  }
}
