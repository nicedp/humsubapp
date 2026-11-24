import { Notice } from '@prisma/client';

export interface NoticeResponse {
  id: string;
  title: string;
  body: string;
  priority: string;
  postedBy: string | null;
  postedOn: Date;
  expiresOn: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export function transformNotice(notice: Notice): NoticeResponse {
  return {
    id: notice.id,
    title: notice.title,
    body: notice.body,
    priority: notice.priority,
    postedBy: notice.postedBy ?? null,
    postedOn: notice.postedOn,
    expiresOn: notice.expiresOn ?? null,
    createdAt: notice.createdAt,
    updatedAt: notice.updatedAt,
  };
}

export function transformNotices(notices: Notice[]): NoticeResponse[] {
  return notices.map(transformNotice);
}