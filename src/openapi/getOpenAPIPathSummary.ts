import { ControllerAPI } from './types';

const getOpenAPIPathSummary = (api: ControllerAPI, name: string) => {
  if (api.summary) {
    return `${api.summary} [${name}]`;
  }

  let summary = '[API]';
  if (api.path.startsWith('/admin') || api.path.startsWith('/api/admin')) {
    summary = '[ADMIN]';
  }

  if (api.schema) {
    summary += api.schema;
  } else if (api.tags) {
    summary += api.tags[0];
  } else {
    summary += `<Object>`;
  }

  if (api.method === 'GET') {
    if (api.schema && api.schema.includes('[]')) {
      summary += '를 목록 조회합니다';
    } else if (api.schema && !api.schema.includes('[]')) {
      summary += '를 상세 조회합니다';
    } else {
      summary += '를 조회합니다';
    }
  } else if (api.method === 'POST') {
    summary += '를 생성합니다';
  } else if (api.method === 'PUT' || api.method === 'PATCH') {
    summary += '를 수정합니다';
  } else if (api.method === 'DELETE') {
    summary += '를 삭제합니다';
  }

  return `${summary} [${name}]`;
};

export default getOpenAPIPathSummary;
