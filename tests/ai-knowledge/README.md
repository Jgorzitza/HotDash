# Knowledge Base System Tests

Comprehensive test suite for validating the AI Knowledge Base system.

## Test Files

### `knowledge-base.test.ts`
Unit and integration tests for all KB components:
- Embedding service
- Ingestion service
- Search service
- RAG context builder
- Learning pipeline
- Search accuracy
- Embedding quality

### `validate-kb-system.ts`
Production validation script that runs comprehensive checks:
- System health
- Database statistics
- Embedding generation and consistency
- Semantic similarity
- Document ingestion
- Semantic search
- RAG context building
- Search accuracy
- Performance benchmarks

## Running Tests

### Unit Tests (Vitest)

```bash
# Run all KB tests
npm test tests/ai-knowledge/knowledge-base.test.ts

# Run with coverage
npm test -- --coverage tests/ai-knowledge/knowledge-base.test.ts

# Watch mode
npm test -- --watch tests/ai-knowledge/knowledge-base.test.ts
```

### Production Validation

```bash
# Run validation script
npx tsx tests/ai-knowledge/validate-kb-system.ts

# Expected output:
# ✅ All critical tests passed!
```

## Test Coverage

### Embedding Service
- ✅ Generate embeddings for text
- ✅ Calculate cosine similarity
- ✅ Handle errors gracefully
- ✅ Embedding consistency
- ✅ Semantic similarity detection

### Ingestion Service
- ✅ Ingest documents successfully
- ✅ Generate embeddings during ingestion
- ✅ Handle invalid categories
- ✅ Store metadata correctly

### Search Service
- ✅ Semantic search with pgvector
- ✅ Category filtering
- ✅ Tag filtering
- ✅ Similarity threshold enforcement
- ✅ Search accuracy validation

### RAG Context Builder
- ✅ Build context for customer questions
- ✅ Filter by category
- ✅ Limit context size
- ✅ Format context for AI prompts

### Learning Pipeline
- ✅ Calculate confidence scores
- ✅ Extract learning from HITL approvals
- ✅ Classify learning types
- ✅ Update KB based on feedback

## Validation Criteria

### System Health
- All components (embedding, database, search) operational
- Database connection successful
- pgvector extension available

### Embedding Quality
- Embeddings are 1536-dimensional (text-embedding-3-small)
- Consistency score > 0.99 for identical text
- Semantic similarity > 0.7 for related content
- Different topics have lower similarity

### Search Accuracy
- Finds relevant articles for common queries
- Respects category filters
- Respects similarity thresholds
- Returns results in order of relevance

### Performance
- Embedding generation < 2 seconds
- Search query < 1 second
- RAG context building < 2 seconds

## Test Data

### Sample Articles
Tests use sample articles covering common categories:
- **Orders**: Tracking, status, modifications
- **Returns**: Policy, process, refunds
- **Shipping**: Methods, times, costs
- **Products**: Specs, compatibility
- **Technical**: Website, account issues
- **Policies**: Terms, privacy, warranties

### Sample Queries
Common customer questions used for testing:
- "How do I track my order?"
- "What is your return policy?"
- "How long does shipping take?"
- "Where is my package?"
- "How can I return an item?"

## Troubleshooting

### Test Failures

**Embedding Generation Fails**
- Check `OPENAI_API_KEY` environment variable
- Verify OpenAI API quota
- Check network connectivity

**Search Returns No Results**
- Ensure database has articles
- Check pgvector extension is installed
- Verify embeddings are generated
- Lower similarity threshold

**Database Connection Errors**
- Check Prisma connection string
- Verify database is running
- Check network/firewall settings

### Common Issues

**"No articles found in database"**
- Run ingestion to add test articles
- Check `is_current = true` filter
- Verify `project = 'occ'` filter

**"Embedding dimension mismatch"**
- Ensure using text-embedding-3-small model
- Check OpenAI API response format
- Verify embedding storage in database

**"Search accuracy below threshold"**
- Add more diverse articles
- Improve article quality
- Adjust similarity thresholds
- Review category assignments

## Continuous Integration

### Pre-commit Checks
```bash
# Run before committing
npm test tests/ai-knowledge/knowledge-base.test.ts
npx tsx tests/ai-knowledge/validate-kb-system.ts
```

### CI Pipeline
Tests run automatically on:
- Pull requests
- Merges to main
- Nightly builds

### Success Criteria
- All unit tests pass
- Validation script passes
- No critical warnings
- Performance within limits

## Metrics

### Test Coverage Goals
- Unit test coverage: > 80%
- Integration test coverage: > 70%
- E2E test coverage: > 60%

### Performance Benchmarks
- Embedding generation: < 2s
- Search query: < 1s
- RAG context: < 2s
- Document ingestion: < 3s

### Quality Metrics
- Search accuracy: > 80%
- Embedding consistency: > 0.99
- Semantic similarity: > 0.7
- System uptime: > 99%

## Maintenance

### Adding New Tests
1. Add test case to `knowledge-base.test.ts`
2. Update validation script if needed
3. Document in this README
4. Run full test suite
5. Update coverage metrics

### Updating Test Data
1. Add new sample articles
2. Add new test queries
3. Update expected results
4. Verify all tests still pass

### Reviewing Test Results
1. Check test output for failures
2. Review warnings and edge cases
3. Update tests for new features
4. Document any known issues

## Support

For issues or questions:
1. Check this README
2. Review test output
3. Check system health status
4. Contact ai-knowledge agent

---

**Last Updated:** 2025-10-23  
**Version:** 1.0  
**Status:** Production Ready

