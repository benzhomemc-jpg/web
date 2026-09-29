import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getMongoDb } from '@/lib/mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type AnyDoc = Record<string, any>;

function cleanDoc<T extends AnyDoc>(doc: T | null): T | null {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return rest as T;
}

function cleanDocs<T extends AnyDoc>(docs: T[]): T[] {
  return docs.map((doc) => cleanDoc(doc) as T);
}

function idOrNew(id?: string): string {
  return id && id.trim() ? id : randomUUID();
}

export async function GET() {
  try {
    const db = await getMongoDb();
    await db.command({ ping: 1 });
    return NextResponse.json({
      ok: true,
      database: process.env.MONGODB_DB || 'mmb_workshop',
      server: '127.0.0.1:27017',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'MongoDB connection failed';
    return NextResponse.json({ ok: false, error: message }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, payload = {} } = await req.json();
    const db = await getMongoDb();
    const now = new Date().toISOString();

    switch (action) {
      case 'jobs:list': {
        const docs = await db.collection('jobs').find({}).sort({ _id: -1 }).toArray();
        return NextResponse.json(cleanDocs(docs));
      }
      case 'jobs:get': {
        const doc = await db.collection('jobs').findOne({ jobNumber: payload.jobNumber });
        return NextResponse.json(cleanDoc(doc));
      }
      case 'jobs:insert': {
        const doc = { ...payload.job, id: idOrNew(payload.job?.id) };
        await db.collection('jobs').insertOne(doc);
        return NextResponse.json(cleanDoc(doc));
      }
      case 'jobs:update': {
        await db.collection('jobs').updateOne(
          { jobNumber: payload.jobNumber },
          { $set: { ...payload.updates } },
        );
        const doc = await db.collection('jobs').findOne({ jobNumber: payload.jobNumber });
        return NextResponse.json(cleanDoc(doc));
      }

      case 'customers:list': {
        const docs = await db.collection('customers').find({}).sort({ createdAt: -1, _id: -1 }).toArray();
        return NextResponse.json(cleanDocs(docs));
      }
      case 'customers:get': {
        const doc = await db.collection('customers').findOne({ id: payload.id });
        return NextResponse.json(cleanDoc(doc));
      }
      case 'customers:insert': {
        const doc = {
          ...payload.customer,
          id: idOrNew(payload.customer?.id),
          createdAt: payload.customer?.createdAt || now,
        };
        await db.collection('customers').insertOne(doc);
        return NextResponse.json(cleanDoc(doc));
      }
      case 'customers:update': {
        await db.collection('customers').updateOne({ id: payload.id }, { $set: payload.updates || {} });
        const doc = await db.collection('customers').findOne({ id: payload.id });
        return NextResponse.json(cleanDoc(doc));
      }
      case 'customers:delete': {
        await db.collection('customers').deleteOne({ id: payload.id });
        return NextResponse.json({ ok: true });
      }

      case 'vehicles:list': {
        const docs = await db.collection('vehicles').find({}).sort({ createdAt: -1, _id: -1 }).toArray();
        return NextResponse.json(cleanDocs(docs));
      }
      case 'vehicles:get': {
        const doc = await db.collection('vehicles').findOne({ id: payload.id });
        return NextResponse.json(cleanDoc(doc));
      }
      case 'vehicles:byCustomer': {
        const docs = await db.collection('vehicles')
          .find({ customerId: payload.customerId })
          .sort({ createdAt: -1, _id: -1 })
          .toArray();
        return NextResponse.json(cleanDocs(docs));
      }
      case 'vehicles:insert': {
        const doc = {
          ...payload.vehicle,
          id: idOrNew(payload.vehicle?.id),
          createdAt: payload.vehicle?.createdAt || now,
        };
        await db.collection('vehicles').insertOne(doc);
        return NextResponse.json(cleanDoc(doc));
      }
      case 'vehicles:update': {
        await db.collection('vehicles').updateOne({ id: payload.id }, { $set: payload.updates || {} });
        const doc = await db.collection('vehicles').findOne({ id: payload.id });
        return NextResponse.json(cleanDoc(doc));
      }
      case 'vehicles:delete': {
        await db.collection('vehicles').deleteOne({ id: payload.id });
        return NextResponse.json({ ok: true });
      }

      case 'staff:list': {
        const docs = await db.collection('staff').find({}).sort({ createdAt: -1, _id: -1 }).toArray();
        return NextResponse.json(cleanDocs(docs));
      }
      case 'staff:byUsername': {
        const doc = await db.collection('staff').findOne({ username: payload.username });
        return NextResponse.json(cleanDoc(doc));
      }
      case 'staff:byRole': {
        const docs = await db.collection('staff')
          .find({ role: payload.role, status: 'active' })
          .sort({ createdAt: -1, _id: -1 })
          .toArray();
        return NextResponse.json(cleanDocs(docs));
      }
      case 'staff:insert': {
        const doc = {
          ...payload.staff,
          id: idOrNew(payload.staff?.id),
          createdAt: payload.staff?.createdAt || now,
        };
        await db.collection('staff').insertOne(doc);
        return NextResponse.json(cleanDoc(doc));
      }
      case 'staff:update': {
        await db.collection('staff').updateOne({ id: payload.id }, { $set: payload.updates || {} });
        const doc = await db.collection('staff').findOne({ id: payload.id });
        return NextResponse.json(cleanDoc(doc));
      }
      case 'staff:delete': {
        await db.collection('staff').deleteOne({ id: payload.id });
        return NextResponse.json({ ok: true });
      }

      case 'activity:list': {
        const limit = Math.min(Math.max(Number(payload.limit) || 100, 1), 500);
        const docs = await db.collection('activity_logs')
          .find({})
          .sort({ timestamp: -1, _id: -1 })
          .limit(limit)
          .toArray();
        return NextResponse.json(cleanDocs(docs));
      }
      case 'activity:insert': {
        const doc = {
          ...payload.log,
          id: randomUUID(),
          timestamp: now,
        };
        await db.collection('activity_logs').insertOne(doc);
        return NextResponse.json({ ok: true });
      }

      case 'requisitions:list': {
        const filter = payload.jobNumber ? { jobNumber: payload.jobNumber } : {};
        const docs = await db.collection('parts_requisitions')
          .find(filter)
          .sort({ createdAt: -1, _id: -1 })
          .toArray();
        return NextResponse.json(cleanDocs(docs));
      }
      case 'requisitions:get': {
        const doc = await db.collection('parts_requisitions').findOne({ id: payload.id });
        return NextResponse.json(cleanDoc(doc));
      }
      case 'requisitions:insert': {
        const id = randomUUID();
        const items = (payload.items || []).map((item: AnyDoc) => ({
          ...item,
          id: idOrNew(item.id),
        }));
        const statusHistory = [{
          from: 'DRAFT',
          to: 'DRAFT',
          changedBy: payload.requestedBy,
          changedByName: payload.requestedByName,
          changedAt: now,
          note: 'สร้างใบเบิก',
        }];
        const doc = {
          id,
          requisitionNumber: payload.requisitionNumber,
          jobNumber: payload.jobNumber,
          vehicleModel: payload.vehicleModel,
          licensePlate: payload.licensePlate,
          requestedBy: payload.requestedBy,
          requestedByName: payload.requestedByName,
          status: 'DRAFT',
          items,
          statusHistory,
          createdAt: now,
          updatedAt: now,
        };
        await db.collection('parts_requisitions').insertOne(doc);
        return NextResponse.json(cleanDoc(doc));
      }
      case 'requisitions:updateStatus': {
        const current = await db.collection('parts_requisitions').findOne({ id: payload.id });
        if (!current) return NextResponse.json(null);
        const change = {
          from: current.status || 'DRAFT',
          to: payload.newStatus,
          changedBy: payload.changedBy,
          changedByName: payload.changedByName,
          changedAt: now,
          note: payload.note || '',
        };
        await db.collection('parts_requisitions').updateOne(
          { id: payload.id },
          {
            $set: { status: payload.newStatus, updatedAt: now },
            $push: { statusHistory: change as any },
          },
        );
        const doc = await db.collection('parts_requisitions').findOne({ id: payload.id });
        return NextResponse.json(cleanDoc(doc));
      }

      case 'settings:get': {
        const doc = await db.collection('app_settings').findOne({ key: payload.key });
        return NextResponse.json(doc ? { found: true, value: doc.value } : { found: false });
      }
      case 'settings:save': {
        await db.collection('app_settings').updateOne(
          { key: payload.key },
          { $set: { value: payload.value, updatedAt: now } },
          { upsert: true },
        );
        return NextResponse.json({ ok: true });
      }

      case 'backup:export': {
        const [customers, vehicles, jobs, staff, activityLogs, partsRequisitions, appSettings] = await Promise.all([
          db.collection('customers').find({}).toArray(),
          db.collection('vehicles').find({}).toArray(),
          db.collection('jobs').find({}).toArray(),
          db.collection('staff').find({}).toArray(),
          db.collection('activity_logs').find({}).toArray(),
          db.collection('parts_requisitions').find({}).toArray(),
          db.collection('app_settings').find({}).toArray(),
        ]);
        return NextResponse.json({
          appName: 'MMB Workshop', version: '3.0-mongodb', createdAt: now,
          customers: cleanDocs(customers), vehicles: cleanDocs(vehicles), jobs: cleanDocs(jobs),
          staff: cleanDocs(staff), activityLogs: cleanDocs(activityLogs),
          partsRequisitions: cleanDocs(partsRequisitions),
          appSettings: cleanDocs(appSettings).map(({ key, value }) => ({ key, value })),
        });
      }
      case 'backup:restore': {
        const data = payload.data || {};
        if (data.appName !== 'MMB Workshop') {
          return NextResponse.json({ error: 'Invalid MMB Workshop backup' }, { status: 400 });
        }
        const collections: Array<[string, AnyDoc[]]> = [
          ['customers', Array.isArray(data.customers) ? data.customers : []],
          ['vehicles', Array.isArray(data.vehicles) ? data.vehicles : []],
          ['jobs', Array.isArray(data.jobs) ? data.jobs : []],
          ['staff', Array.isArray(data.staff) ? data.staff : []],
          ['activity_logs', Array.isArray(data.activityLogs) ? data.activityLogs : []],
          ['parts_requisitions', Array.isArray(data.partsRequisitions) ? data.partsRequisitions : []],
          ['app_settings', Array.isArray(data.appSettings) ? data.appSettings.map((item: AnyDoc) => ({ ...item, updatedAt: now })) : []],
        ];
        for (const [name, docs] of collections) {
          const collection = db.collection(name);
          await collection.deleteMany({});
          if (docs.length) await collection.insertMany(docs.map((doc) => { const { _id, ...rest } = doc; return rest; }));
        }
        return NextResponse.json({ ok: true });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${String(action)}` }, { status: 400 });
    }
  } catch (error) {
    console.error('/api/db:', error);
    const message = error instanceof Error ? error.message : 'Database request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
