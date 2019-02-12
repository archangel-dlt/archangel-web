<xsl:stylesheet
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xip="http://www.tessella.com/XIP/v4"
    version="1.0">
  <xsl:output method="text"/>

  <xsl:template match="/">
    {
    "data": {
    "key": "<xsl:value-of select="/xip:XIP/xip:Collections/xip:Collection/xip:CollectionRef"/>",
    "pack": "sip",
    "collection": "<xsl:value-of select="/xip:XIP/xip:Collections/xip:Collection/xip:Title"/>"
    },
    "files": [
      <xsl:for-each select="/xip:XIP/xip:Files/xip:File">
      {
        "path":"<xsl:value-of select="xip:WorkingPath"/>",
        "name":"<xsl:value-of select="xip:FileName"/>",
	"type":"<xsl:call-template name="type"/>",
	"puid":"",
	"sha256_hash":"<xsl:call-template name="hash"/>",
	"size":"<xsl:value-of select="xip:FileSize"/>",
	"last_modified":"<xsl:value-of select="xip:LastModifiedDate"/>",
	"uuid":"<xsl:value-of select="xip:FileRef"/>"
      }<xsl:if test="position() != last()"><xsl:text>,</xsl:text></xsl:if>
      </xsl:for-each>
    ]
    }
  </xsl:template>

  <xsl:template name="type">
    <xsl:choose>
      <xsl:when test="xip:Directory = 'false'">
	<xsl:text>File</xsl:text>
      </xsl:when>
      <xsl:when test="xip:Directory = 'true'">
	<xsl:text>Folder</xsl:text>
      </xsl:when>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="hash">
    <xsl:value-of select="xip:FixityInfo[xip:FixityAlgorithmRef = 3]/xip:FixityValue"/>
  </xsl:template>

  <xsl:template match="node()"/>

</xsl:stylesheet>
