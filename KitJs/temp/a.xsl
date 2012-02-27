<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template match="/">
		<html>
			<head>
				<link rel="stylesheet" href="a.css"/>
			</head>
			<body>
				<div>
					<xsl:apply-templates/>
				</div>
			</body>
		</html>
	</xsl:template>
	<xsl:template match="item[@lang='en']/title">
		<xsl:copy>
			中文翻译:
			<xsl:apply-templates/>
		</xsl:copy>
	</xsl:template>
	<xsl:template match="item[@lang='en']/edition">
		<xsl:copy>
			修订版本:
			<xsl:apply-templates/>
		</xsl:copy>
	</xsl:template>
	<xsl:template match="item[@lang='en']/description">
		<xsl:copy>
			修订版本:
			<xsl:apply-templates/>
		</xsl:copy>
	</xsl:template>
	<xsl:template match="item[@lang='en']/publisher">
		<xsl:copy>
			出版社:
			<ol>
				<xsl:apply-templates/>
			</ol>
		</xsl:copy>
	</xsl:template>
	<xsl:template match="item[@lang='en']/publisher/author">
		<li class="author">
			作者:
			<xsl:apply-templates/>
		</li>
	</xsl:template>
	<xsl:template match="item[@lang='en']/publisher/email">
		<li class="email">
			email:
			<xsl:apply-templates/>
		</li>
	</xsl:template>
	<xsl:template match="item[@lang='en']/publisher/website">
		<li class="website">
			website:
			<xsl:apply-templates/>
		</li>
	</xsl:template>
	<xsl:template match="item[@lang='en']/publisher/copyright">
		<li class="copyright">
			copyright:
			<xsl:apply-templates/>
		</li>
	</xsl:template>
	<xsl:template match="*">
		<xsl:copy>
			<xsl:apply-templates/>
		</xsl:copy>
	</xsl:template>
</xsl:stylesheet>