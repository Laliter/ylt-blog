import type { Metadata } from "next";
import { ProfileCarousel } from "@/components/ProfileCarousel";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "About",
  description: "ylt，Java 后端开发工程师。",
};

export default function AboutPage() {
  return (
    <div className="site-shell" id="top">
      <SiteHeader active="about" />
      <main className="about-page page-frame">
        <h1 className="visually-hidden">About ylt</h1>

        <section className="about-profile-layout">
          <aside className="about-person">
            <div className="about-avatar-shell">
              <ProfileCarousel variant="about" />
            </div>
            <strong>ylt</strong>
            <p>Java 后端开发工程师</p>
            <span>Alibaba</span>
          </aside>

          <div className="about-story">
            <p>
              我是 ylt（余丽婷），一名 Java 后端开发工程师，目前在阿里巴巴集团参与核心业务系统的设计与研发。
              2017 年入行，先后经历大搜车与阿里巴巴，业务足迹覆盖交易、采购、跨境出行与数据平台。
            </p>
            <p>
              我擅长复杂业务系统的架构设计：订单状态机与全生命周期管理、异步交易链路、分库分表、
              分布式锁与幂等设计、消息最终一致性，以及大促场景下的高并发与稳定性保障。
            </p>
            <p>
              近年聚焦 AI 工程化提效：基于 Spring AI 与向量数据库构建智能答疑系统，
              落地智能报表分析、智能调价与交易风控等场景，并熟练运用 Claude Code、Cursor 等
              AI 编程工具融入日常研发流程。
            </p>
            <p>
              技术栈：Java / Spring Boot / MyBatis、微服务架构、MySQL / Redis / Tair、
              Kafka / MetaQ、Flink 实时计算与 Hive 离线数仓。
            </p>
            <p>
              教育背景：台州学院 · 计算机科学与技术（本科，专业前 3%）。邮箱：395662401@qq.com。
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
